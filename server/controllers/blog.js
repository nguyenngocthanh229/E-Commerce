const Blog = require('../models/blog')
const asyncHandler = require('express-async-handler')

const createNewBlog = asyncHandler(async(req, res) => { 
    const {title, description, category} = req.body
    if (!title || !description || !category) throw new Error('Missing inputs')
    const response = await Blog.create(req.body)
    return res.json({
        success: response ? true : false,
        createdBlog: response ? response : 'Cannot create new blog'
    })
})
const updateBlog = asyncHandler(async(req, res) => { 
    const {bid} = req.params
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    const response = await Blog.findByIdAndUpdate(bid, req.body, {new: true})
    return res.json({
        success: response ? true : false,
        updatedBlog: response ? response : 'Cannot update blog'
    })
})
const getBlogs = asyncHandler(async(req, res) => { 
    const response = await Blog.find()
    return res.json({
        success: response ? true : false,
        blogs: response ? response : 'Cannot get blogs'
    })
})

/*
Khi người dùng like một bài blog thì: 
1. Check xem người đó trước đó có dislike hay không => bỏ dislike
2. Check xem người đó trước đó có like hay không => bỏ like / thêm like
 */
const likeBlog = asyncHandler(async(req, res) => { 
   const {_id} = req.user
   const {bid} = req.params
   if (!bid) throw new Error('Missing inputs')
   const blog = await Blog.findById(bid)
   const alreadyDisliked = blog?.dislikes?.find(el => el.toString() === _id)
   if (alreadyDisliked){
       const response = await Blog.findByIdAndUpdate(bid, {$pull: {dislikes: _id}}, {new: true})
       return res.json({
        success: response ? true: false,
        rs: response
       })
   }
   const isLiked = blog?.likes?.find(el => el.toString() === _id)
   if (isLiked){
    const response = await Blog.findByIdAndUpdate(bid, {$pull: {likes: _id}}, {new: true})
    return res.json({
        success: response ? true: false,
        rs: response
       })
   }else{
       const response = await Blog.findByIdAndUpdate(bid, {$push: {likes: _id}}, {new: true})
       return res.json({
        success: response ? true: false,
        rs: response
       })
   }
 })
 const dislikeBlog = asyncHandler(async(req, res) => { 
    const {_id} = req.user
    const {bid} = req.params
    if (!bid) throw new Error('Missing inputs')
    const blog = await Blog.findById(bid)
    const alreadyLiked = blog?.likes?.find(el => el.toString() === _id)
    if (alreadyLiked){
        const response = await Blog.findByIdAndUpdate(bid, {$pull: {likes: _id}}, {new: true})
        return res.json({
         success: response ? true: false,
         rs: response
        })
    }
    const isDisliked = blog?.dislikes?.find(el => el.toString() === _id)
    if (isDisliked){
     const response = await Blog.findByIdAndUpdate(bid, {$pull: {dislikes: _id}}, {new: true})
     return res.json({
         success: response ? true: false,
         rs: response
        })
    }else{
        const response = await Blog.findByIdAndUpdate(bid, {$push: {dislikes: _id}}, {new: true})
        return res.json({
         success: response ? true: false,
         rs: response
        })
    }
  })
const excludeFields = '-refreshToken -password -role -createAt -updatedAt'
const getBlog = asyncHandler(async(req, res) => { 
    const {bid} = req.params
    const blog = await Blog.findById(bid).populate('likes', excludeFields)
    return res.json({
        success: blog ? true: false,
        rs: blog
       })
 })

module.exports = {
    createNewBlog,
    updateBlog,
    getBlogs,
    likeBlog,
    dislikeBlog,
    getBlog
}