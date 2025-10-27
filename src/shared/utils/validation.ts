/**
 * Validation utilities for Cosmic Whiskers
 * Ensures data integrity and state transitions
 */

import type {
  BattleState,
  BattlePhase,
  BattleStatus,
  PlayerAction,
} from '../types/game.js';

// ============================================================================
// Battle State Validation
// ============================================================================

export function isValidBattleStatus(status: string): status is BattleStatus {
  return ['waiting', 'active', 'completed'].includes(status);
}

export function isValidBattlePhase(phase: string): phase is BattlePhase {
  return ['predicting', 'voting', 'revealing', 'completed'].includes(phase);
}

export function canTransitionToPhase(
  currentPhase: BattlePhase,
  nextPhase: BattlePhase
): boolean {
  const validTransitions: Record<BattlePhase, BattlePhase[]> = {
    predicting: ['voting', 'completed'],
    voting: ['revealing', 'completed'],
    revealing: ['predicting', 'completed'],
    completed: [],
  };

  return validTransitions[currentPhase].includes(nextPhase);
}

// ============================================================================
// Player Action Validation
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePrediction(
  action: PlayerAction,
  battleState: BattleState
): ValidationResult {
  // Check if battle is active or waiting (allow predictions in both states)
  if (battleState.status !== 'active' && battleState.status !== 'waiting') {
    return { valid: false, error: `Battle is ${battleState.status}. Cannot submit prediction.` };
  }

  // Check if round exists
  const round = battleState.rounds[action.roundNumber - 1];
  if (!round) {
    return { valid: false, error: 'Invalid round number' };
  }

  // Check if round is in predicting phase
  if (round.phase !== 'predicting') {
    return { valid: false, error: 'Round is not in predicting phase' };
  }

  // Check if player is active
  if (!battleState.activePlayers.has(action.playerId)) {
    return { valid: false, error: 'Player is not active in this battle' };
  }

  // Check if option exists
  const optionExists = round.options.some((opt) => opt.id === action.optionId);
  if (!optionExists) {
    return { valid: false, error: 'Invalid option selected' };
  }

  // Check if player already predicted
  if (round.predictions.has(action.playerId)) {
    return { valid: false, error: 'Player has already made a prediction' };
  }

  return { valid: true };
}

export function validateVote(
  action: PlayerAction,
  battleState: BattleState
): ValidationResult {
  // Check if battle is active or waiting (allow voting in both states)
  if (battleState.status !== 'active' && battleState.status !== 'waiting') {
    return { valid: false, error: `Battle is ${battleState.status}. Cannot submit vote.` };
  }

  // Check if round exists
  const round = battleState.rounds[action.roundNumber - 1];
  if (!round) {
    return { valid: false, error: 'Invalid round number' };
  }

  // Check if round is in voting phase
  if (round.phase !== 'voting') {
    return { valid: false, error: 'Round is not in voting phase' };
  }

  // Check if option exists
  const optionExists = round.options.some((opt) => opt.id === action.optionId);
  if (!optionExists) {
    return { valid: false, error: 'Invalid option selected' };
  }

  // Check if player already voted
  if (round.votes.has(action.playerId)) {
    return { valid: false, error: 'Player has already voted' };
  }

  // For spectator votes, check if player is a spectator
  if (action.type === 'spectator_vote') {
    if (!battleState.spectators.has(action.playerId)) {
      return { valid: false, error: 'Player is not a spectator' };
    }
  } else {
    // For regular votes, check if player is active
    if (!battleState.activePlayers.has(action.playerId)) {
      return { valid: false, error: 'Player is not active in this battle' };
    }
  }

  return { valid: true };
}

// ============================================================================
// Time Validation
// ============================================================================

export function isRoundExpired(roundStartTime: number, duration: number): boolean {
  return Date.now() > roundStartTime + duration * 1000;
}

export function getRemainingTime(startTime: number, duration: number): number {
  const elapsed = Date.now() - startTime;
  const remaining = duration * 1000 - elapsed;
  return Math.max(0, Math.floor(remaining / 1000));
}

// ============================================================================
// Winner Determination
// ============================================================================

export function calculateWinners(
  totalPlayers: number,
  activePlayers: number
): { isWinner: boolean; winnerThreshold: number } {
  // Top 10% are winners
  const winnerThreshold = Math.ceil(totalPlayers * 0.1);
  const isWinner = activePlayers <= winnerThreshold;

  return { isWinner, winnerThreshold };
}

export function calculateRank(
  activePlayers: number,
  eliminatedPlayers: number
): number {
  // Rank is based on how many players are left
  // Lower number = better rank
  return activePlayers;
}

// ============================================================================
// Prediction Accuracy
// ============================================================================

export function calculateAccuracy(
  correctPredictions: number,
  totalPredictions: number
): number {
  if (totalPredictions === 0) return 0;
  return Math.round((correctPredictions / totalPredictions) * 100);
}
