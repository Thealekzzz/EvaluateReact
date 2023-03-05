Date.prototype.getStrDate = function() {
    return [
        this.getFullYear(),
        this.getMonth() + 1 < 10 ? ("0" + (this.getMonth() + 1)) : (this.getMonth() + 1),
        this.getDate() < 10 ? ("0" + this.getDate()) : this.getDate(),
        this.getHours() < 10 ? ("0" + this.getHours()) : this.getHours(),
        this.getMinutes() < 10 ? ("0" + this.getMinutes()) : this.getMinutes(),
        this.getSeconds() < 10 ? ("0" + this.getSeconds()) : this.getSeconds(),
    ].join("_")
}