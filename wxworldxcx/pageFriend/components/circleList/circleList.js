var util = require('../../../utils/util.js');
//index.js
var that = undefined;
// var doommList = [];
var doommTop = [5, 10, 15, 10, 25, 30, 35, 40];
var i = 0;
// var ids = 0;
// var cycle = null //计时器

// 弹幕参数
class Doomm {
	constructor(text, top, left, color, time) { //内容，顶部距离，运行时间，颜色（参数可自定义增加）
		this.text = text;
		this.top = top;
		this.left = left;
		this.color = color;
		this.width = text.length * 16;
		this.time = time
		this.display = true;
		this.id = i++;
		this.endTime = 0
	}
}
// // 弹幕字体颜色
// function getRandomColor() {
// 	let rgb = []
// 	for (let i = 0; i < 3; ++i) {
// 		let color = Math.floor(Math.random() * 256).toString(16)
// 		color = color.length == 1 ? '0' + color : color
// 		rgb.push(color)
// 	}
// 	return '#' + rgb.join('')
// }

var doommData = [];
var barrage_style_obj = {};
var phoneWidth = 0;
var timers = [];
// var timer;
Component({
	properties: {
		item: {
			type: Object,
			value: {}
		},
		index: {
			type: Number,
			value: 0
		},
		auth: {
			type: Boolean,
			value: false
		},
		type: {
			type: String,
			value: "1" // 1列表2单条
		},
		isFocus: {
			type: Boolean,
			value: false // 是否显示关注
		},
		isShowFly: {
			type: Boolean,
			value: true // 是否显示弹幕
		},
		myAvatar: {
			type: String,
			value: ''
		},
	},
	data: {
		info: {},
		dotIndex: 0,
		comment: '',
		replayName: '',
		id: '',
		reuid: '',
		reid: '',
		// doommData: [{
		// 	text : '14555555555555555555555555',
		// 	top : 10,
		// 	width : 375,
		// 	color : '#fff',
		// 	display : true,
		// 	id : 0,
		// }],
		doommData: [],
		// doommList:[],
		cycle: null,
		timer: null,
		ids: 0,
		track: {},
		moodData: {},
		isFirst: 0
	},
	observers: {
		'item': function(num) {
			if (!num.isScroll) {
				// tab切换
				let arr = []
				num.dynamic_remark_list.forEach((item => {
					arr.push(item)
					if (item.son) {
						this.getRemarkList(arr, item)
					}
				}))
				num.dynamic_remark_list = arr
				// 评论是否只显示两条
				num.isCommentMore = !arr.length>1
				// 是否显示评论拥抱工具栏
				num.showReportMask = false
				this.setData({
					info: num
				})
				// 判断动态文字长度
				this.getTextHeight()
				// 弹幕
				this.moveBarrage()
			}else{
				// 滚动
				let info = this.data.info
				if (!num.autoplay) {
					// 滚动被遮盖后清除
					this.pause()
				}else{
					// 出现且没开过开弹幕
					if(!info.autoplay && num.autoplay){
						info.autoplay = num.autoplay
						this.setData({
							info
						})
						this.moveBarrage()
					}else{
						// this.moveBarrage()
					}
					
				}
				info.autoplay = num.autoplay
				this.setData({
					info
				})
			}
		},
		'isShowFly': function(num) {
			if (this.data.isFirst > 0) {
				if (num) {
					this.moveBarrage()
				} else {
					this.pause()
				}
			}

		}
	},
	detached: function() {
		clearInterval(this.data.cycle)
		this.setData({
			ids: 0,
			doommData: []
		})
	},
	attached: function() {
		this.setData({
			user_id: wx.getStorageSync('user_id') || ''
		})
		let that = this
		// 获取屏幕的宽度
		wx.getSystemInfo({
			success: function(res) {
				phoneWidth = res.windowWidth
				that.setData({
					phoneWidth: res.windowWidth
				})
			}
		})
	},
	methods: {
		changeReportMask(){
			let num = this.data.info
			num.showReportMask = !num.showReportMask 
			this.setData({
				info: num
			})
		},
		pause() {
			clearInterval(this.data.cycle)
			clearInterval(this.data.timer)
		},
		triggleFly() {
			this.setData({
				isFirst: this.data.isFirst + 1
			})
			this.triggerEvent("triggleFly", !this.data.isShowFly);
		},
		moveBarrage() {
			this.pause()
			this.setData({
				ids: 0,
				doommData: []
			})
			let that = this
			let arr = that.data.info.dynamic_remark_list
			let data = []
			let ids = that.data.ids
			if ( that.data.info.autoplay && that.data.isShowFly) {
				if(arr.length > 0){
					function getArr() {
						if (arr[ids] == undefined) {
							ids = 0
						}
						let num = 0
						data = data.filter((item, index) => {
							// 开始和移除
							if (item.left != item.width * -1 && num == 0) {
								item.left = item.width * -1
								item.endTime = new Date().getTime() + item.time * 1000
								num = num + 1
							}
							return item.endTime >= new Date().getTime()
						})
						// 水平不重叠
						let color = arr[ids].user_id == that.data.user_id ? '#0091FF' : '#fff'
						let track = that.data.track
						
						function getTopTime() {
							let top = doommTop[Math.floor(Math.random() * 8)]
							if (track[top] && track[top] > new Date().getTime()) {
								let n = null
								doommTop.forEach((item)=>{
									if(track[item] && track[item] < new Date().getTime()){
										n = item
									}
								})
								return n
								// return getTopTime()
							} else {
								return top
							}
						}
						
						let top = getTopTime()
						if (!top) return
						let time = Math.ceil((arr[ids].remark.length * 16 + phoneWidth) / 37.5)
						let topTime = Math.ceil((arr[ids].remark.length * 16) / 37.5) * 1000 + 200 + new Date().getTime()
						track[top] = topTime
						// 添加评论
						data.push(new Doomm(arr[ids].remark, top, phoneWidth, color, time));
						that.setData({
							track,
							doommData: data,
							ids: ++ids
						})
					}
					this.data.cycle = setInterval(getArr, 1000)
					getArr()
				}

				if (this.data.info.message && this.data.info.cicleType == 'img') {
				
					let initTop = [60, 70, 80, 90]

					let top = initTop[Math.floor(Math.random() * 4)]
					let text = this.data.info.message

					wx.createSelectorQuery()
						.in(that)
						.select('.aon-left')
						.boundingClientRect(function(res) {
							let width = res.width
							let time = Math.ceil((width + phoneWidth) / 37.5)
							// 添加评论
							let moodData = new Doomm('', top, phoneWidth, '#fff', time);
							that.setData({
								moodData
							})

							function changeLocal() {
								let moodData = that.data.moodData
								moodData.left = -1 * width
								that.setData({
									moodData
								})
								setTimeout(() => {
									let moodData = that.data.moodData
									moodData.left = phoneWidth
									that.setData({
										moodData
									})
								}, 1000)
							}
							that.data.timer = setInterval(changeLocal, time * 1000 + 1000)
							changeLocal()
						})
						.exec();
				}
			}
		},
		getTextHeight() {
			let that = this
			setTimeout(() => {
				if (this.data.item.message && this.data.item.message.length > 52) {
					wx.createSelectorQuery()
						.in(that)
						.select('.msg-box')
						.boundingClientRect(function(res) {
							let data = that.data.info
							data.textOver = res.height > 48
							that.setData({
								info: data
							})
						})
						.exec();
				}
			}, 10)

		},
		triggleText() {
			if (!this.data.info.textOver) return
			let data = this.data.info
			data.textIsShow = !data.textIsShow
			this.setData({
				info: data
			})
		},
		triggleComment() {
			let data = this.data.info
			data.isCommentMore = !data.isCommentMore
			this.setData({
				info: data
			})
		},
		getRemarkList(arr, item) {
			item.son.forEach((items => {
				items.isReply = true
				items.replyName = item.userInfo.nickname
				arr.push(items)
				if (items.son) {
					this.getRemarkList(arr, items)
				}
			}))
		},
		delComment(e) {
			var that = this;
			let cid = e.target.dataset.cid || e.currentTarget.dataset.cid
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/deleteRemarks',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					shop_id: wx.getStorageSync('watch_shop_id') || '',
					// remark:that.data.comment || '',
					remark_id: cid,
					user_dynamic_id: that.data.info.id || '',
				},
				success: function(ress) {
					if (ress.error == 0) {
						that.triggerEvent("refreshPage", {
							index: that.data.index
						});
					} else {
						wx.showToast({
							title: ress.msg,
							icon: 'none',
							duration: 2000
						});
					}
				}
			})
		},

		longPressComment(e) {
			let i = e.target.dataset.i || e.currentTarget.dataset.i
			let arr = this.data.info
			if (e.type == "longpress" && arr.dynamic_remark_list[i].user_id != this.data.user_id) {
				console.log('不是本人不能删除')
				return
			}
			arr.dynamic_remark_list.forEach((item, index) => {
				if (index == i) {
					// 同一个
					item.active = !item.active
				} else {
					item.active = false
				}
			})
			this.setData({
				info: arr
			})
		},
		changeIndex(e) {
			let index = e.detail
			this.setData({
				dotIndex: index || 0
			})
		},
		goComment(e) {
			let id = e.target.dataset.id || e.currentTarget.dataset.id
			let index = e.target.dataset.index || e.currentTarget.dataset.index
			let items = e.target.dataset.iteminfo || e.currentTarget.dataset.iteminfo || ''
			let reuid = e.target.dataset.reuid || e.currentTarget.dataset.reuid
			let reid = e.target.dataset.reid || e.currentTarget.dataset.reid
			let name = (items && items.user_id != this.data.user_id) ? items.userInfo.nickname : ''
			let item = {
				id,
				index,
				reuid,
				reid,
				name
			}
			if (items && items.user_id == this.data.user_id) {
				// 本人的回复显示删除
				this.longPressComment(e)
			} else {
				let data = this.data.info
				if(data.showReportMask){
					data.showReportMask = false
				}
				data.commentMask = true
				this.setData({
					replayName: name || '',
					info: data,
					id,
					reuid,
					reid,
				})
				// this.triggerEvent("goComment", item);
			}
		},
		getInputText(e) {
			this.setData({
				comment: e.detail.value
			})
		},
		//用户输入内容--提交输入
		submit() {
			var that = this;
			if (!that.data.comment) {
				wx.showToast({
					icon: 'none',
					title: '请输入内容'
				})
				return;
			}

			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/addRemarks',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					shop_id: wx.getStorageSync('watch_shop_id') || '',
					remark: that.data.comment || '',
					remark_id: that.data.reid || '',
					user_dynamic_id: that.data.id || '',
					remark_user_id: that.data.reuid || ''
				},
				success: function(ress) {
					if (ress.error == 0) {
						that.setData({
							comment: '',
							reid: '',
							id: '',
							reuid: '',
							commentMask: false
						})
						that.triggerEvent("refreshPage", {
							index: that.data.index
						});
					} else {
						wx.showToast({
							title: ress.msg,
							icon: 'none',
							duration: 2000
						});
					}
				}
			})

		},
		changeDel() {
			let that = this;
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/deleteUserDynamic',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					dynamic_id: that.data.item.id || ''
				},
				success: function(ress) {
					if (ress.error == 0) {
						that.triggerEvent("refreshPage", {
							index: that.data.index
						});
					} else {
						wx.showToast({
							title: ress.msg,
							icon: 'none',
							duration: 2000
						});
					}
				}
			})
		},
		goComfort(e) {
			let id = e.target.dataset.id || e.currentTarget.dataset.id
			let index = e.target.dataset.index || e.currentTarget.dataset.index
			// let item = {
			// 	id,
			// 	index
			// }
			// this.triggerEvent("goComfort", item);
			let info = this.data.info
			if(info.showReportMask){
				info.showReportMask = false
				this.setData({
					info
				})
			}
			var that = this;
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/hugDynamic',
				data: {
					user_id: wx.getStorageSync('user_id'),
					dynamic_id: id || ""
				},
				success: function(ress) {
					if (ress.error == 0) {
						// let arr = that.data.list
						// arr[index].hug_num = ress.data.hug_state ? (arr[index].hug_num * 1 + 1) : (arr[index].hug_num * 1 - 1)
						// arr[index].hug_state = ress.data.hug_state ? 1 : 0,
						// arr[index].myHugList = ress.data.hug_state ? arr[index].myHugList = arr[index].myHugList.push(that.data.userInfo.Wechat_xcxSetUser.nickname):arr[index].myHugList.filter((x) => x !== that.data.userInfo.Wechat_xcxSetUser.nickname)
						// that.setData({
						// 	list: arr
						// })
						// that.refreshPage(item)
						that.triggerEvent("refreshPage", {
							index
						});
					} else {
						wx.showToast({
							title: ress.msg,
							icon: 'none',
							duration: 2000
						});
					}
				}
			})
		},
		goDetail() {
			let userId = this.data.item.treport.bind_treport_user_table_id || ''
			wx.navigateTo({
				url: '/pageFriend/pageFriend/userDetail/userDetail?id=' + this.data.item.user_id + '&userId=' + userId
			})
		},
		goReportDetail(e) {
			if(this.data.auth || this.data.info.user_id == this.data.user_id){
				let dev = e.target.dataset.dev || e.currentTarget.dataset.dev
				let id = e.target.dataset.id || e.currentTarget.dataset.id
				let bindid = e.target.dataset.bindid || e.currentTarget.dataset.bindid
				wx.navigateTo({
					url: '/pageWatch/pageWatch/treport/treport?DeviceIdentity=' + dev + '&id=' + id + '&bindid=' + bindid
				})
			}
		},
		triggleFocus() {
			this.triggerEvent("triggleFocus", {
				index: this.data.index,
				item: this.data.item
			});
		},
	}
})
