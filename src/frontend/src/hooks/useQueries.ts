import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ServiceCategory,
  ServiceOrder,
  SmmService,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Balance ─────────────────────────────────────────────────────────────────

export function useGetBalance() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<number>({
    queryKey: ["balance", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getBalance();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deposit(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["balance", identity?.getPrincipal().toString()],
      });
    },
  });
}

// ─── Categories ──────────────────────────────────────────────────────────────

export function useGetCategories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ServiceCategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Services ────────────────────────────────────────────────────────────────

export function useGetServicesByCategory(categoryId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SmmService[]>({
    queryKey: ["services", categoryId?.toString()],
    queryFn: async () => {
      if (!actor || categoryId === null) return [];
      return actor.getServicesByCategory(categoryId);
    },
    enabled: !!actor && !actorFetching && categoryId !== null,
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function useGetMyOrders() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ServiceOrder[]>({
    queryKey: ["myOrders", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({
      serviceId,
      link,
      quantity,
    }: {
      serviceId: bigint;
      link: string;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.placeOrder(serviceId, link, quantity);
    },
    onSuccess: () => {
      const principal = identity?.getPrincipal().toString();
      queryClient.invalidateQueries({ queryKey: ["balance", principal] });
      queryClient.invalidateQueries({ queryKey: ["myOrders", principal] });
    },
  });
}

// ─── Initialize (admin) ──────────────────────────────────────────────────────

export function useInitialize() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.initialize();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
