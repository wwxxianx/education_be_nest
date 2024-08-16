import { secondsToMilliseconds } from "../utils/time";

export const redisConstants = Object.freeze({
  COURSE_CATEGORY_KEY: 'cache:course-categories',
  COURSE_CATEGORY_TTL: secondsToMilliseconds(30),
  
  COURSE_KEY: 'cache:courses',
  COURSE_TTL: secondsToMilliseconds(3),

  COURSE_LEVEL_KEY: 'cache:levels',
  COURSE_LEVEL_TTL: secondsToMilliseconds(3),

  LANGUAGE_KEY: 'cache:languages',
  LANGUAGE_TTL: secondsToMilliseconds(10),
  
  USER_FAVOURITE_COURSE_KEY: 'cache:user-favourite-courses:',
  USER_FAVOURITE_COURSE_TTL: secondsToMilliseconds(3),
});