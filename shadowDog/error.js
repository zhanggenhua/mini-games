class MyError extends Error {
  /**
   *
   * @param {*} message 消息
   * @param {*} code 错误代码
   * @param {*} data 附加数据
   */
  constructor(message, data = null, code = -1) {
      super(message);
      this.name = 'myError';
      this.code = code;
      this.data = Object.assign({}, data);
  }
}
export default MyError;
