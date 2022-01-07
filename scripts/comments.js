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
                "comment": this.comments_dict[i].comment
            }
        }
        return comments
    }

    getNumberOfComments() {
        return this.length
    }
}