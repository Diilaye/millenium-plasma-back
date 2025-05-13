import BaseController from "./base.controller";

import ReviewsClient, { IReviewsClient } from '../models/interfaces/reviews-client.interface'; 

export default class ReviewsClientController  extends BaseController<IReviewsClient> {
    constructor() {
        super(ReviewsClient);
    }

}