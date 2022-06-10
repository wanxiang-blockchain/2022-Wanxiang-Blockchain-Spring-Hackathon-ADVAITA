var util = require('../../../utils/util.js');
var app = getApp()
var config = require('../../../config');
Page({
	data: {
		isLoading: false,
		cardNum:1,
		cardNum2:1
	},
	onLoad: function(options) {
		//公用设置参数
		let that = this
		app.commonInit(options, this,async function(tokenInfo) {
			that.setData({
				articleId:options.articleId||'585'
			});
			that.getcardInfo()
		})
	},
	back(e) {
		wx[e.detail]({
			url: '/pageShop/pageShop/meditation/meditation'
		})
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	getEnergy(){
		
	},
	changeNum(e) {
		var that = this
		let type = e.target.dataset.type || e.currentTarget.dataset.type
		let id = e.target.dataset.id || e.currentTarget.dataset.id
		let num = id == 1 ? this.data.cardNum:this.data.cardNum2
		let numCount = type == 1 ? (num*1 - 1) : (num*1 + 1) 
		if (numCount == 0) {
			wx.showToast({
				title: '宝贝不能再减少了',
				icon: 'none',
				duration: 2000
			});
			return
		}else{
			if(id == 1){
				this.setData({
					cardNum:numCount
				});	
			}else{
				this.setData({
					cardNum2:numCount
				});
			}
			
		}
		
	},
	changeType(e){
		let id = e.target.dataset.id || e.currentTarget.dataset.id
		this.setData({
			articleId:id
		});
		this.getContent()
	},
	signRepair(e) {
		// 获取补签数据
		if (this.data.isLoading) return;
		let type = e.target.dataset.type || e.currentTarget.dataset.type
		let enoughPay = true
		let num = type == 1?this.data.cardNum:this.data.cardNum2
		let score = num*1 * this.data.info.sign_cart_to_integral
		if(type == 1 && score > this.data.info.surplus_integral){
			enoughPay = false
		}
		if(type == 2 && score > this.data.info.surplus_integral){
			enoughPay = false
		}
		if(!enoughPay){
			wx.showToast({
				title: '积分不足',
				icon: 'none',
				duration: 2000
			});
			return
		}
		this.setData({
			isLoading : true,
		})
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Article/integralSignRepair",
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				on_line_course_id: 0,
				article_id: 94,
				integral_num:score,
				type:type
			},
			success: function(res) {
				that.setData({
					isLoading : false,
				})
				if (res.error == 0) {
					that.getcardInfo()
				} else if(res.error == 2){
					that.getcardInfo()
				}else {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		});
	},
	getcardInfo() {
		// 获取补签数据
		if (this.data.isLoading) return;
		this.setData({
			isLoading : true,
		})
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Article/signRepairInfo",
			data: {
				user_id:wx.getStorageSync('user_id') || '',
			},
			success: function(res) {
				that.setData({
					isLoading : false,
				})
				if (res.error == 0) {
					that.setData({
						info : res.data,
					})
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		});
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageHappy', 'signature/signature');
		data.share_true_url = data.share_true_url.replace('pages', 'pageHappy');
		console.log(data.share_true_url);
		return {
			title: that.data.about.title||'文章',
			// imageUrl: tokenInfo.shareAgencyPoster.share_image_url,
			path: data.share_true_url,
			success: function(res) {
				//添加分享记录
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/User/addShareLog',
					data: data,
					success: function(res) {
						console.log('成功分享记录');
						console.log(res);
					}
				}) //end 分享记录
			}
		}
	}, //end 分享接口
})
