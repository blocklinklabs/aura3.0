import { gql } from "graphql-request";
import { useQuery } from "@tanstack/react-query";

// Define types for your Graph entities
interface ConsentUpdated {
  id: string;
  user: string;
  consentType: string;
  value: boolean;
  blockNumber: string;
  blockTimestamp: string;
}

interface InterventionLogged {
  id: string;
  user: string;
  interventionType: string;
  outcome: string;
  blockNumber: string;
  blockTimestamp: string;
}

interface UserConsent {
  id: string;
  aiInterventions: boolean;
  emergencyContact: boolean;
  dataSharing: boolean;
  lastUpdated: string;
  auditLogs: AuditLog[];
}

interface AuditLog {
  id: string;
  interventionType: string;
  timestamp: string;
  outcome: string;
}

// GraphQL queries
const QUERIES = {
  getUserConsent: gql`
    query GetUserConsent($userId: String!) {
      userConsent(id: $userId) {
        id
        aiInterventions
        emergencyContact
        dataSharing
        lastUpdated
        auditLogs {
          id
          interventionType
          timestamp
          outcome
        }
      }
    }
  `,

  getLatestInterventions: gql`
    query GetLatestInterventions($userId: String!, $first: Int!) {
      interventionLoggeds(
        first: $first
        where: { user: $userId }
        orderBy: blockTimestamp
        orderDirection: desc
      ) {
        id
        interventionType
        outcome
        blockTimestamp
      }
    }
  `,

  getConsentHistory: gql`
    query GetConsentHistory($userId: String!) {
      consentUpdateds(
        where: { user: $userId }
        orderBy: blockTimestamp
        orderDirection: desc
      ) {
        id
        consentType
        value
        blockTimestamp
      }
    }
  `,
};

// Utility class for Graph interactions
export class GraphService {
  private static readonly GRAPH_URL =
    "https://api.studio.thegraph.com/query/31052/aura-subgraph/version/latest";

  static async getUserConsent(userId: string): Promise<UserConsent | null> {
    const response = await fetch(this.GRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: QUERIES.getUserConsent,
        variables: { userId },
      }),
    });

    const data = await response.json();
    return data.data?.userConsent || null;
  }

  static async getLatestInterventions(
    userId: string,
    first: number = 5
  ): Promise<InterventionLogged[]> {
    const response = await fetch(this.GRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: QUERIES.getLatestInterventions,
        variables: { userId, first },
      }),
    });

    const data = await response.json();
    return data.data?.interventionLoggeds || [];
  }

  static async getConsentHistory(userId: string): Promise<ConsentUpdated[]> {
    const response = await fetch(this.GRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: QUERIES.getConsentHistory,
        variables: { userId },
      }),
    });

    const data = await response.json();
    return data.data?.consentUpdateds || [];
  }
}

// React Query hooks
export function useUserConsent(userId: string) {
  return useQuery({
    queryKey: ["userConsent", userId],
    queryFn: () => GraphService.getUserConsent(userId),
  });
}

export function useLatestInterventions(userId: string, first: number = 5) {
  return useQuery({
    queryKey: ["interventions", userId, first],
    queryFn: () => GraphService.getLatestInterventions(userId, first),
  });
}

export function useConsentHistory(userId: string) {
  return useQuery({
    queryKey: ["consentHistory", userId],
    queryFn: () => GraphService.getConsentHistory(userId),
  });
}
