import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../utils/API";

/*
 * Contains logic from threads loading, listing and viewing, along with their respective comments loading, viewing.
 */


// --- Actions ---
const BASE = 'thread/';
const LOAD_LIST = BASE + 'loadList';
const LOAD_SINGLE = BASE + 'loadSingle';
const LOAD_COMMENTS = BASE + 'loadComments';

const PENDING = '/pending'; // Used to combine async thunk name, e.g. TOKEN_REFRESH+FULFILLED
const FULFILLED = '/fulfilled';
const REJECTED = '/rejected';


// --- Action Creators ---
/**
 * @param url Url defining list GET params, like page, perpage, orderby, orderdir.
 * e.g. url='?page=1&perpage=20&orderby=id&orderdir=DESC'
 */
export const getThreads = createAsyncThunk(LOAD_LIST, (url, thunkAPI) => {
    return API.Threads.GetList(url)
        .then(response => {

            let payload = response.json();
            if (response.ok) {
                return payload;
            }
            else
                // TODO test if does not return a promise
                return thunkAPI.rejectWithValue(payload);
        });
});

/**
 * @param id Thread id to load
 */
export const getSingleThread = createAsyncThunk(LOAD_SINGLE, (id, thunkAPI) => {
    let findResult = thunkAPI.getState().threads.list.items.find(t => t.id === id);
    if (findResult !== undefined)
        return findResult;

    return API.Threads.GetSingle(id)
        .then(response => {
            let payload = response.json();
            if (response.ok) {
                return payload;
            } else {
                return payload.then(x => thunkAPI.rejectWithValue(x));
            }
        });
});

/**
 * @param url Url defining thread id and comments list GET params, like page, perpage, orderby, orderdir.
 * e.g. url='/threads/100/comments/?page=1&perpage=20&orderby=id&orderdir=DESC'
 */
export const getComments = createAsyncThunk(LOAD_COMMENTS, (url, thunkAPI) => {
    return API.Threads.GetCommentsList(url)
        .then(response => {
            let payload = response.json();
            if (response.ok) {
                return payload;
            } else {
                return payload.then(x => thunkAPI.rejectWithValue(x));
            }
        });
});

// --- State ---
const initialState = {
    list: { // Threads list
        url: null, // URL from which list was loaded, including pagination, sorting, filtering params.
                   // Can be used to check if currently loaded list is the needed one, if the url matches.
                   // For that reason URL generation helper method should be always used to get new url.
        loaded: 0, // LoadState.NotRequested
        pagination: {},
        items: [
            /*example item: {
                id, title, content, createdAt, updatedAt, edited, commentsCount,
                userVote, votesCount, author: {
                    id, username, roles: []
                }
            }*/
        ]
    },
    single: { // Single thread, currently viewed
        id: null, // This thread id, same as in item.id. Repeated here to avoid
                  // additional item===null check before checking item id
        item: null, // Actual thread object
        loaded: 0, // LoadState.NotRequested
        comments: { // Comments for currently viewed thread
            url: null,
            loaded: false,
            pagination: {},
            items: []
        }
    }
}

// --- Reducer ---
export const threadSlice = createSlice({
    name: 'thread',
    initialState: initialState,
    reducers: {
    },
    extraReducers: {
        [getThreads.pending]: (state, action) => {
            state.list.loaded = LoadState.Loading;
            state.list.url = action.meta.arg;
        },
        [getThreads.fulfilled]: (state, action) => {
            // state.list.url = action.payload.url;
            state.list.loaded = LoadState.Done;
            state.list.pagination = action.payload.pagination;
            state.list.items = action.payload.items;
        },
        [getThreads.rejected]: (state, action) => {
            state.list.url = action.payload.url;
            state.list.loaded = LoadState.Done;
            // TODO change .code to .error.status and test it
            console.log('Failed fetching threads: ' + getSafe(() => action.payload.code, 'unknown error'));
        },

        [getSingleThread.pending]: (state, action) => {
            state.single.loaded = LoadState.Loading;
            state.single.id = action.meta.arg;
        },
        [getSingleThread.fulfilled]: (state, action) => {
            state.single.item = action.payload;
            state.single.loaded = LoadState.Done;
        },
        [getSingleThread.rejected]: (state, action) => {
            // state.single.id = null;
            // state.single.item = null;
            // state.single.loaded = LoadState.NotRequested; // Commented out because causes infinite loop
            console.log(`Failed fetching thread #${action.meta.arg}: ${getSafe(() => action.payload.error.status, 'unknown error')}`);
        },

        [getComments.pending]: (state, action) => {
            state.single.comments.loaded = LoadState.Loading;
            state.single.comments.url = action.meta.arg;
        },
        [getComments.fulfilled]: (state, action) => {
            state.single.comments.loaded = LoadState.Done;
            state.single.comments.items = action.payload.items;
            state.single.comments.pagination = action.payload.pagination;
        },
        [getComments.rejected]: (state, action) => {
            // state.single.comments.items = null;
            console.log(`Failed fetching comments: ${action.meta.arg}, error: ${getSafe(() => action.payload.error.status, 'unknown error')}`);
        },
    }
});


// --- Middleware ---
export const threadMiddleware = ({ getState, dispatch }) => {
    return function (next) {
        return function (action) {

            switch (action.type) {
            }

            return next(action);

        }
    }
};
