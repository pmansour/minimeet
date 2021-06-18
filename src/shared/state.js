
/* The states of the login process. */
const LOGIN_STATE = Object.freeze({
    UNKNOWN: 0,
    LOGGED_OUT_SAME_ACCOUNT: 1,
    LOGGED_OUT_NO_ACCOUNT: 2,
    ENTER_EMAIL: 3,
    ENTER_PASSWORD_SAME_ACCOUNT: 4,
    ENTER_PASSWORD_WRONG_ACCOUNT: 5,
});

const LOGIN_ACTION = Object.freeze({
    UNKNOWN: 0,
    GET_STATE: 1,
    CHOOSE_EXISTING_PROFILE: 2,
    CHOOSE_ANOTHER_ACCOUNT: 3,
    ENTER_EMAIL: 4,
    ENTER_PASSWORD: 5,
    SWITCH_ACCOUNT: 6,
});

const MEET_ACTION = Object.freeze({
    UNKNOWN: 0,
    GET_NEXT_MEETING_ID: 1,
});