/**
 * CrediWise Recommendation Engine
 * Rule-based scoring algorithm that ranks payment instruments
 * for a given transaction to maximize reward value.
 */

/**
 * Compute the estimated INR reward value for a single instrument given a transaction.
 * @param {Object} instrument - PaymentInstrument document
 * @param {number} amount - Transaction amount in INR
 * @param {string} category - Transaction category
 * @returns {Object} scoring result
 */
const scoreInstrument = (instrument, amount, category) => {
    // Find the best matching reward rule (category-specific first, then 'general')
    let rule = instrument.rewardRules.find(r => r.category === category);
    if (!rule) rule = instrument.rewardRules.find(r => r.category === 'general');

    // No rule at all
    if (!rule) {
        return {
            estimatedReward: 0,
            effectiveRate: '0%',
            capReached: false,
            minTxFailed: false,
            milestoneAlert: null,
            explanation: `No reward rule configured for ${category} or general category.`,
            appliedRule: null,
        };
    }

    // Min transaction check
    if (amount < rule.minTransactionAmount) {
        return {
            estimatedReward: 0,
            effectiveRate: '0%',
            capReached: false,
            minTxFailed: true,
            milestoneAlert: null,
            explanation: `Minimum transaction of ₹${rule.minTransactionAmount} required. No reward for this transaction.`,
            appliedRule: rule,
        };
    }

    // Cap check — estimate rewards already earned this month
    const currentMonthRewardsEarned = instrument.currentMonthSpend * (rule.ratePercent / 100) * rule.pointValueINR;
    let capReached = false;
    let estimatedReward = amount * (rule.ratePercent / 100) * rule.pointValueINR;

    if (rule.cap > 0 && currentMonthRewardsEarned >= rule.cap) {
        capReached = true;
        estimatedReward = 0;
    } else if (rule.cap > 0 && currentMonthRewardsEarned + estimatedReward > rule.cap) {
        // Partial reward up to the cap
        estimatedReward = rule.cap - currentMonthRewardsEarned;
    }

    const effectiveRate = `${rule.ratePercent}%`;

    // Build explanation string
    let explanation = '';
    const rewardLabel = rule.rewardType === 'cashback' ? 'cashback' : rule.rewardType === 'points' ? 'points' : 'miles';

    if (capReached) {
        explanation = `⚠️ Reward cap of ₹${rule.cap} reached this month. No additional ${rewardLabel} earned.`;
    } else if (estimatedReward < amount * (rule.ratePercent / 100) * rule.pointValueINR) {
        explanation = `${rule.ratePercent}% ${rewardLabel} on ${capitalize(category)}. ` +
            `Partial reward — cap nearly reached. Est. ₹${estimatedReward.toFixed(2)} back.`;
    } else if (rule.rewardType === 'cashback') {
        explanation = `${rule.ratePercent}% cashback on ${capitalize(category)}. Est. ₹${estimatedReward.toFixed(2)} back.`;
    } else {
        explanation = `${rule.ratePercent}% ${rewardLabel} on ${capitalize(category)} ` +
            `(₹${rule.pointValueINR}/pt). Est. ₹${estimatedReward.toFixed(2)} value.`;
    }

    // Milestone proximity check
    let milestoneAlert = null;
    if (instrument.milestoneIncentives && instrument.milestoneIncentives.length > 0) {
        const totalAfterTx = instrument.currentMonthSpend + amount;
        for (const milestone of instrument.milestoneIncentives) {
            if (instrument.currentMonthSpend < milestone.spendThreshold && totalAfterTx >= milestone.spendThreshold) {
                milestoneAlert = `🎯 This transaction unlocks a ₹${milestone.bonusValue} milestone bonus!`;
                estimatedReward += milestone.bonusValue;
                break;
            } else if (totalAfterTx < milestone.spendThreshold) {
                const gap = milestone.spendThreshold - totalAfterTx;
                if (gap <= milestone.spendThreshold * 0.15) { // within 15% of threshold
                    milestoneAlert = `🎯 Spend ₹${gap.toFixed(0)} more to unlock a ₹${milestone.bonusValue} bonus!`;
                }
            }
        }
    }

    return { estimatedReward, effectiveRate, capReached, minTxFailed: false, milestoneAlert, explanation, appliedRule: rule };
};

/**
 * Rank all instruments for a given transaction.
 * @param {Array} instruments - Array of PaymentInstrument documents
 * @param {number} amount - Transaction amount
 * @param {string} category - Transaction category
 * @returns {Array} Sorted rankings array
 */
const rankInstruments = (instruments, amount, category) => {
    const scored = instruments.map(instrument => {
        const result = scoreInstrument(instrument, amount, category);
        return {
            instrumentId: instrument._id,
            instrumentName: instrument.name,
            bankOrProvider: instrument.bankOrProvider,
            type: instrument.type,
            network: instrument.network,
            color: instrument.color,
            ...result,
        };
    });

    // Sort: by estimatedReward desc, then by name asc as tiebreaker
    scored.sort((a, b) => b.estimatedReward - a.estimatedReward || a.instrumentName.localeCompare(b.instrumentName));

    // Assign ranks
    return scored.map((item, idx) => ({ ...item, rank: idx + 1 }));
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

module.exports = { rankInstruments, scoreInstrument };
