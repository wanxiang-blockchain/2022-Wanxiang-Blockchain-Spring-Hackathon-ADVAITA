var util = require('../../../utils/util.js')
var app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        videoList: [], //视频集合
        videoSrc: "",
        index: 0,
        wechatRoomId: 0,
        showCover: true,
        isAuto: true
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (options.share_user_id != undefined) {
            wx.setStorageSync("share_user_id", options.share_user_id);
        }
        var that = this;
        //公用设置参数
        app.commonInit(options, this, function(tokenInfo) {
            // that.checkMember()
            that.setData({
                wechatRoomId: options.wechatid
            }, () => {
                that.getRoom(options.wechatid);
            });
        });
    },
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
	},
    async checkMember() {
        if (this.data.userInfo.is_need_up_user_pay != 1) {
            let ispay = await app.getMemberInfo();
            app.globalData.memberInfo = ispay;
        } else {
            app.globalData.memberInfo = {
                is_need_up_user_pay: 1
            };
        }
        this.setData({
            isMember: app.globalData.memberInfo.is_need_up_user_pay
        });
    },
    goback() {
        wx.navigateTo({
            url: "../room/room?wechatid=" + this.data.wechatRoomId
        });
    },
    getRoom(wechatRoomId) {
        var that = this;

        wx.showLoading({ title: '加载中', icon: 'loading' });
        util.ajax({
            url: util.config("baseApiUrl") + "Api/Live/getWechatAnchorRoomInfo",
            data: {
                wechat_anchor_room_id: wechatRoomId
            },
            success: function(res) {
                if (res.error == 0) {
                    that.setData({
                        room: res.data,
                        videoList: res.data.replay_url,
                        videoSrc: res.data.replay_url[0]
                    });
                    if (!that.data.userInfo) {
                        // 未登录
                        that.setData({
                            is_auth: 1
                        })
                        wx.hideLoading()
                    }
                } else {
                    wx.showToast({
                        title: res.msg,
                        icon: "none",
                        duration: 2000
                    });
                    setTimeout(function() {
                        wx.navigateTo({
                            url: "../room/room?wechatid=" + wechatRoomId
                        });
                    }, 2000);
                }
            }
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        this.videoContext = wx.createVideoContext("myVideo")
    },
    //显示用户登录窗口
    showLogin: function(e) {
        if (this.data.is_auth == 1) {
            this.setData({
                is_auth: 0,
            })
        } else {
            this.setData({
                is_auth: 1,
            })
        }
        return false;
    },
    //用户登录
    clickGetUserInfo: function(res) {
        var that = this;
        app.clickGetUserInfo(res, that, function(tokenInfo) {
            //重新载入
            that.onLoad(wx.getStorageSync('_GET'));
        });
    },
    videoStart() {
        // let memberInfo = getApp().globalData.memberInfo.is_need_up_user_pay
        // if(memberInfo == 1){
        // 会员
        if (this.data.showCover) {
            this.setData({
                showCover: false,
                isAuto: false
            })
            wx.hideLoading()
        }
        // }else{
        //   // 非会员
        //   wx.redirectTo({
        //     url: "/pages/member/member"
        //   });
        // }
    },
    videoEnd() {
        // 视频播放结束后执行的方法
        var that = this;
        if (that.data.index == that.data.videoList.length - 1) {
            wx.showToast({
                title: "播放结束",
                icon: "loading",
                duration: 1000,
                mask: true
            });
            this.setData({
                index: 0,
                isAuto: false,
                videoSrc: this.data.videoList[0]
            })
            this.videoContext.pause();
        } else {
            that.videoPlay()
        }
    },
    videoPlay() {
        var that = this;
        this.setData({
            index: this.data.index + 1,
            videoSrc: this.data.videoList[this.data.index + 1]
        }, () => {
            this.videoContext.autoplay == "true";
            this.videoContext.play();
        });

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {},

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},
    goBack() {
        let pages = getCurrentPages()
        if (pages.length == 1) {
            wx.redirectTo({
                url: "/pagesTest/room/room?wechatid=" + this.data.wechatRoomId
            });
        } else {
            wx.navigateBack()
        }
    },
    /**
     * 用户点击右上角分享
     */
	// 分享接口
	onShareAppMessage(res) {
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageLive', 'replay/replay');
		data.share_true_url = data.share_true_url.replace('pages', 'pageLive');
		data.share_true_url = data.share_true_url+ "&wechatid=" + this.data.wechatRoomId
		console.log('分享数据：');
		console.log(data.share_true_url);
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/addShareLog',
			data: data,
			success: function(res) {
				console.log('成功分享记录');
				console.log(res);
			}
		})
		return {
			title: '重庆瑜伽医学大会',
			path: data.share_true_url
		}
	},
});