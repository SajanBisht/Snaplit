export enum QUERY_KEYS {
  // AUTH KEYS
  CREATE_USER_ACCOUNT = "createUserAccount",

  // USER KEYS
  GET_CURRENT_USER = "getCurrentUser",
  GET_USERS = "getUsers",
  GET_USER_BY_ID = "getUserById",

  // POST KEYS
  GET_POSTS = "getPosts",
  GET_INFINITE_POSTS = "getInfinitePosts",
  GET_RECENT_POSTS = "getRecentPosts",
  GET_POST_BY_ID = "getPostById",
  GET_USER_POSTS = "getUserPosts",
  GET_FILE_PREVIEW = "getFilePreview",

  //  SEARCH KEYS
  SEARCH_POSTS = "getSearchPosts",

  // Comment KEYS
  GET_COMMENTS = "handleCommentSubmit",
  DELETE_COMMENTS = "deleteComments",
  GET_USERS_BY_IDS = "getUsersByIds",
  GET_SUBCOMMENTS = 'fetchSubcomments',
  ADD_SUBCOMMENT = 'addSUBComment',
  ADD_LIKE_TO_COMMENT = 'addLikeToComment',

  //User Posts
  GET_USER_OWN_POSTS = 'getUserOwnPosts',
  GET_USER_SAVED_POSTS = 'getUserSavedPosts',

  //Reels Section
  GET_REELS_FROM_DB = 'getReelsFromDB',
  
  //get user by username
  GET_USER_BY_USERNAME = 'getUserWithThisUsername',
  
  //get user fillowers
  GET_USER_FOLLOWERS='userFollowers',
  GET_USER_FOLLOWING='userFollowing',
}