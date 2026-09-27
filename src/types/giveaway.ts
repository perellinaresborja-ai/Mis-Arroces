export type GiveawayStatus = 'ACTIVE' | 'CLOSED' | 'DRAWN' | 'CANCELLED'
export type GiveawayResultRole = 'WINNER' | 'ALTERNATE'
export type GiveawayResultStatus = 'CONFIRMED' | 'REPLACED' | 'CLAIMED'

export interface Giveaway {
  id: string
  post_id: string | null
  organizer_id: string
  certificate_code: string
  title: string
  prize: string
  description?: string | null
  starts_at: string
  ends_at: string
  num_winners: number
  num_alternates: number
  status: GiveawayStatus
  require_follow: boolean
  require_like: boolean
  require_comment: boolean
  min_mentions: number
  required_keyword?: string | null
  excluded_usernames: string[]
  terms_and_conditions: string
  organizer_disclaimer_accepted: boolean
  closed_at?: string | null
  drawn_at?: string | null
  cancelled_at?: string | null
  cancel_reason?: string | null
  total_eligible_count: number
  total_evaluated_count: number
  selection_hash?: string | null
  post_snapshot?: any | null
  created_at: string
  updated_at: string
  // Relaciones
  organizer?: {
    id: string
    username: string
    display_name: string | null
    avatar?: { storage_path: string } | null
  }
  results?: GiveawayResultItem[]
  audit_logs?: GiveawayAuditLogItem[]
}

export interface GiveawayAuditLogItem {
  id: string
  action: string
  details: any
  created_at: string
  actor?: {
    id: string
    username: string
    display_name: string | null
  }
}

export interface GiveawayParticipant {
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  hasFollow: boolean
  hasLike: boolean
  hasComment: boolean
  mentionsCount: number
  hasKeyword: boolean
  isExcluded: boolean
  isEligible: boolean
  missingCriteria: string[]
  earliestActionAt: string
}

export interface GiveawayResultItem {
  id: string
  giveaway_id: string
  user_id: string
  role: GiveawayResultRole
  position: number
  status: GiveawayResultStatus
  selected_at: string
  replaced_at?: string | null
  replacement_reason?: string | null
  replaced_by_user_id?: string | null
  user?: {
    id: string
    username: string
    display_name: string | null
    avatar?: { storage_path: string } | null
  }
  replaced_by_user?: {
    id: string
    username: string
    display_name: string | null
    avatar?: { storage_path: string } | null
  }
}

export interface CreateGiveawayInput {
  title: string
  prize: string
  description?: string
  startsAt?: string
  endsAt: string
  numWinners: number
  numAlternates: number
  requireFollow: boolean
  requireLike: boolean
  requireComment: boolean
  minMentions: number
  requiredKeyword?: string
  excludedUsernames?: string[]
  termsAndConditions: string
  organizerDisclaimerAccepted: boolean
}
