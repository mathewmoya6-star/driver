import { getCurrentUser } from './auth.js';

// Application state
let state = {
    user: null,
    currentPage: 'home',
    loading: false,
    error: null,
    materials: {},
    questions: {},
    pagination: {}
};

let listeners = [];

function notifyListeners() {
    listeners.forEach(listener => listener(state));
}

export function subscribe(listener) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
}

export function getState() {
    return { ...state };
}

export function setState(updates) {
    state = { ...state, ...updates };
    notifyListeners();
}

export async function initializeState() {
    setState({ loading: true });
    try {
        const user = await getCurrentUser();
        setState({ user, loading: false });
    } catch (error) {
        setState({ error: error.message, loading: false });
    }
}

export function setUser(user) {
    setState({ user });
}

export function clearUser() {
    setState({ user: null });
}

export function setPage(page) {
    setState({ currentPage: page });
}

export function setLoading(loading) {
    setState({ loading });
}

export function setError(error) {
    setState({ error });
}

export function cacheMaterials(moduleType, page, data) {
    const key = `${moduleType}_${page}`;
    const current = state.materials;
    setState({ materials: { ...current, [key]: data } });
}

export function getCachedMaterials(moduleType, page) {
    const key = `${moduleType}_${page}`;
    return state.materials[key];
}

export function cacheQuestions(moduleType, data) {
    const current = state.questions;
    setState({ questions: { ...current, [moduleType]: data } });
}

export function getCachedQuestions(moduleType) {
    return state.questions[moduleType];
}
