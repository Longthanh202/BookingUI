import {
  DefaultError,
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function useAppMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>
): UseMutationResult<TData, TError, TVariables, TOnMutateResult> {
  return useMutation(options);
}

export const useAppQueryClient = useQueryClient;
