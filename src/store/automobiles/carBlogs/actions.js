import { ADD_CAR_BLOG_FAIL, ADD_CAR_BLOG_SUCCESS, ADD_NEW_CAR_BLOG, DELETE_ALL_CAR_BLOG, DELETE_ALL_CAR_BLOG_FAIL, DELETE_ALL_CAR_BLOG_SUCCESS, DELETE_CAR_BLOG, DELETE_CAR_BLOG_FAIL, DELETE_CAR_BLOG_SUCCESS, GET_CAR_BLOGS, GET_CAR_BLOGS_FAIL, GET_CAR_BLOGS_SUCCESS, GET_CAR_MODEL_BY_BRAND, GET_CAR_MODEL_BY_BRAND_FAILED, GET_CAR_MODEL_BY_BRAND_SUCCESS, GET_COUNTRIES_LIST, GET_COUNTRIES_LIST_ERROR, GET_COUNTRIES_LIST_SUCCESS, UPDATE_CAR_BLOG, UPDATE_CAR_BLOG_FAIL, UPDATE_CAR_BLOG_SUCCESS } from "./actionTypes";
  
  export const getCarBlogs = () => ({
    type: GET_CAR_BLOGS,
  });
  
  export const getCarBlogsSuccess = carBlogs => ({
    type: GET_CAR_BLOGS_SUCCESS,
    payload: carBlogs,
  });
  
  export const getCarBlogsFail = error => ({
    type: GET_CAR_BLOGS_FAIL,
    payload: error,
  });
  
  export const addNewCarBlog = data => ({
    type: ADD_NEW_CAR_BLOG,
    payload: data,
  });
  
  export const addCarBlogSuccess = event => ({
    type: ADD_CAR_BLOG_SUCCESS,
    payload: event,
  });
  
  export const addCarBlogFail = error => ({
    type: ADD_CAR_BLOG_FAIL,
    payload: error,
  });
  
  export const updateCarBlog = (id, data) => ({
    type: UPDATE_CAR_BLOG,
    payload: { id, data },
  });
  
  export const updateCarBlogSuccess = data => ({
    type: UPDATE_CAR_BLOG_SUCCESS,
    payload: data,
  });
  
  export const updateCarBlogFail = error => ({
    type: UPDATE_CAR_BLOG_FAIL,
    payload: error,
  });
  
  export const deleteCarBlog = carBlog => ({
    type: DELETE_CAR_BLOG,
    payload: carBlog,
  });
  
  export const deleteCarBlogSuccess = carBlog => ({
    type: DELETE_CAR_BLOG_SUCCESS,
    payload: carBlog,
  });
  
  export const deleteCarBlogFail = error => ({
    type: DELETE_CAR_BLOG_FAIL,
    payload: error,
  });

  export const deleteAllCarBlogs = () => ({
    type: DELETE_ALL_CAR_BLOG,
  });
  
  export const deleteAllCarBlogsSuccess = () => ({
    type: DELETE_ALL_CAR_BLOG_SUCCESS,
  });
  
  export const deleteAllCarBlogsFail = error => ({
    type: DELETE_ALL_CAR_BLOG_FAIL,
    payload: error,
  });

  export const getCountriesList = () => { 
    return ({
    type: GET_COUNTRIES_LIST
  })};

  export const getCountriesListSuccess = data => { 
    return ({
    type: GET_COUNTRIES_LIST_SUCCESS,
    payload: data
  })};

  export const getCountriesListError = error => ({
    type: GET_COUNTRIES_LIST_ERROR,
    payload: error
  })

  export const getCarModelsByBrand = id => ({
    type: GET_CAR_MODEL_BY_BRAND,
    payload: { id }
  })

  export const getCarModelsByBrandSuccess = data => ({
    type: GET_CAR_MODEL_BY_BRAND_SUCCESS,
    payload: data
  })

  export const getCarModelsByBrandFailed = error => ({
    type: GET_CAR_MODEL_BY_BRAND_FAILED,
    payload: error
  })
  
  