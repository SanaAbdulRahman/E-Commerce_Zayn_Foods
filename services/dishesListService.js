const { CATEGORY } = require("../utils/constants/schemaName");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const batchModel = require("../models/batchModel");
const { format } = require("date-fns");

const getDishesForDishesList = async () => {
        try {
            const currentTime = format(new Date(), "HH:mm:ss");
            let batches = await batchModel.aggregate([
                {
                    $match: {
                        status: true,
                    },
                },
                {
                    $addFields: {
                        startTime: {
                            $substr: [
                                {
                                    $dateToString: {
                                        format: "%H:%M:%S",
                                        date: "$startingTime",
                                        timezone: "Asia/Kolkata",
                                    },
                                },
                                0,
                                8,
                            ],
                        },
                    },
                },
                {
                    $addFields: {
                        endTime: {
                            $substr: [
                                {
                                    $dateToString: {
                                        format: "%H:%M:%S",
                                        date: "$closingTime",
                                        timezone: "Asia/Kolkata",
                                    },
                                },
                                0,
                                8,
                            ],
                        },
                    },
                },
                {
                    $match: {
                        $or: [
                            {
                                batchName: "All Time",
                            },
                            {
                                $and: [
                                    { startTime: { $lte: currentTime } },
                                    { endTime: { $gte: currentTime } },
                                ],
                            },
                        ],
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dishes: 1,
                    },
                },
            ]);
            let dishes = await batchModel.populate(batches, {
                path: "dishes",
                populate: [
                    {
                        path: "productCategory",
                        ref: CATEGORY,
                        select: "categoryName -_id",
                    },
                ],
            });
            return dishes
        } catch (err) {
            nextDay(err)
        }
};


const getCategoriesForDishesList = async () => {
        try {
            let categories = await categoryModel.aggregate([
                {
                    $addFields: {
                        productSize: {
                            $cond: {
                                if: { $isArray: "$dishes" },
                                then: { $size: "$dishes" },
                                else: 0,
                            },
                        },
                    },
                },
                {
                    $sort: {
                        productSize: -1,
                    },
                },
                {
                    $project: {
                        categoryName: 1,
                    },
                },
            ]);
            return categories
        } catch (err) {
           next(err)
        }
};




module.exports = {getDishesForDishesList, getCategoriesForDishesList }