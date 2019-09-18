class BaseService {

    constructor(Model) {
        this.Model = Model;
    }

    get(id) {
        return this.Model.find({ _id: id }).lean();
    }

    delete(id) {
        return this.Model.deleteOne({ _id: id }).lean();
    }

    add(body) {
        return this.Model(body).save();
    }

    update(id, body) {
        return this.Model.updateOne({ _id: id }, body).lean();
    }

}

module.exports = BaseService;