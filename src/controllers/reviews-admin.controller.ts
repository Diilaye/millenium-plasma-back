import BaseController from "./base.controller";

import ReviewsAdmin, { IReviewsAdmin } from '../models/interfaces/reviews-admin.interface'; 

export default class ReviewsAdminController  extends BaseController<IReviewsAdmin> {
    constructor() {
        super(ReviewsAdmin);
    }

}