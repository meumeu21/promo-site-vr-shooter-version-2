export type {
    AdminImportCompletedMatchRequest,
    AdminRole,
    HistoryIngestMatchRequest,
    HistoryMatchListFilters,
    HistoryMatchListItem,
    MatchClub,
    MatchDetail,
    MatchPlayerStats,
    MatchTeam,
    MatchTeamResult,
    MatchTeamSide,
    MatchTeamSummary,
    PaginatedHistoryMatchesResponse,
    PaginationMeta
} from '@packages/shared';

export interface PartnerPayload {
    name: string;
    company: string;
    city: string;
    phone?: string;
    email?: string;
    website?: string;
    message?: string;
    source?: string;
}

export interface BookingPayload {
    city: string;
    club: string;
    date: string;
    slot: string;
    name: string;
    phone: string;
    comment?: string;
    source?: string;
}
