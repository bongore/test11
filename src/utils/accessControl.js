import { useEffect, useState } from "react";

function createDefaultAccessState() {
    return {
        isLoading: true,
        address: "",
        isConnected: false,
        canViewLive: false,
        isTeacher: false,
        hasProfile: false,
        canBroadcastLive: false,
        isAuthorizedUser: false,
        canAnswerQuiz: false,
        canJoinLive: false,
    };
}

async function resolveAccessState(cont) {
    const nextState = createDefaultAccessState();

    try {
        const address = await cont?.get_address?.();
        if (!address) {
            return {
                ...nextState,
                isLoading: false,
            };
        }

        nextState.address = address;
        nextState.isConnected = true;

        const [isTeacherResult, userData] = await Promise.all([
            cont?.isTeacher?.().catch(() => false),
            cont?.get_user_data?.(address).catch(() => null),
        ]);

        nextState.isTeacher = Boolean(isTeacherResult);
        nextState.hasProfile = Boolean(userData?.[3]);
        nextState.canBroadcastLive = nextState.isTeacher;
        nextState.canViewLive = nextState.isConnected;
        nextState.isAuthorizedUser = nextState.isConnected;
        nextState.canAnswerQuiz = nextState.isConnected;
        nextState.canJoinLive = nextState.isConnected;
    } catch (error) {
        console.error("Failed to resolve access state", error);
    }

    return {
        ...nextState,
        isLoading: false,
    };
}

function useAccessControl(cont) {
    const [accessState, setAccessState] = useState(() => createDefaultAccessState());

    useEffect(() => {
        let active = true;

        const load = async () => {
            setAccessState((current) => ({ ...current, isLoading: true }));
            const nextState = await resolveAccessState(cont);
            if (active) {
                setAccessState(nextState);
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [cont]);

    return accessState;
}

export {
    resolveAccessState,
    useAccessControl,
};
