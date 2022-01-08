class Comments {
    constructor(comments_dict, length) {
        this.comments_dict = comments_dict
        this.length = length
    }

    getComments() {
        let comments = {}
        for (let i in this.comments_dict) {
            comments[i] = {
                "user_id": this.comments_dict[i].user_id,
                "email": this.comments_dict[i].email,
                "comment": this.comments_dict[i].comment
            }
        }
        return comments
    }

    getCommentAt(idx) {
        return this.comments_dict[idx]
    }

    getNumberOfComments() {
        return this.length
    }
}