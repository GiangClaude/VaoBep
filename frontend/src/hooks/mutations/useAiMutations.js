import { useMutation } from '@tanstack/react-query';
import aiApi from '../../api/aiApi';

export const useChatMutation = () => {
    return useMutation({
        mutationFn: (payload) => aiApi.chat(payload) // payload: { userId, message, sessionId, currentContext }
    });
};

export const useClearAiHistoryMutation = () => {
    return useMutation({
        mutationFn: (payload) => aiApi.clearHistory(payload) // payload: { sessionId, userId }
    });
};

export const useSummarizeMutation = () => {
    return useMutation({
        mutationFn: (payload) => aiApi.summarize(payload) // payload: { contextText }
    });
};