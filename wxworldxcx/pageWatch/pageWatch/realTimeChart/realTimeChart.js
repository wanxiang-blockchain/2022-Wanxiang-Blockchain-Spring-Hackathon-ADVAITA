import * as echarts from '../../../utils/ec-canvas/echarts';
var util = require('../../../utils/util.js');
var setOptions = require('../../../utils/setOptions.js');
var app = getApp();
var chartBPM = null
var chartBP = null
var chartMBB = null
Page({
  data: {
    URL: 1,
    ecBP: {
      disableTouch: true,
      lazyLoad: true
    },
    ecBPM: {
      disableTouch: true,
      lazyLoad: true
    },

    ecMBB: {
      disableTouch: true,
      lazyLoad: true
    },

    todayDate: '',
    bpmData: [],
    systolicData: [],
    diastoliData: [],
    mbbData: [],
    bpmLoading: false,
    bpLoading: false,

    name: 'OMSAT',
    uuid: '9C2C4841-69C3-4742-9F69-764351FB0783',
    write: '9C2C48A5-69C3-4742-9F69-764351FB0783',
    notify: '9C2C485A-69C3-4742-9F69-764351FB0783',
    deviceId: '',

    mbbData: [],
    mbbDataT: [],
  },
  onReady() {
    // 获取组件
    this.ecBPMComponent = this.selectComponent('#mychart-dom-bpm');
    this.ecBPComponent = this.selectComponent('#mychart-dom-bp');
    this.ecMBBComponent = this.selectComponent('#mychart-dom-mbb');
  },
  /**
   * 每当小程序可能被销毁之前，页面回调函数 onSaveExitState 会被调用
   */
  onSaveExitState: function () {
    chartBPM = null
    chartBP = null
    chartMBB = null
    this.offBluetooth();
  },
  onLoad: function (options) {
    var that = this
    //公用设置参数
    app.commonInit(options, this, function (tokenInfo) {
      that.setData({
        todayDate: util.formatOnlyDates(new Date()),
        deviceId: (options.device_id ? options.device_id : wx.getStorageSync('DeviceIdentity'))
      })
      // that.getTreport(wx.getStorageSync('DeviceIdentity'))

      // that.realData('A6E600DA00E800F400FD0109010F011001130116011F011B011F01270122008D00A8000000000000000000AA66');//实时传输测试
      // setTimeout(()=>{
      //     setInterval(function () {
      //       that.realData('A6E600DA00E800F400FD0109010F011001130116011F011B011F01270122008D00A8000000000000000000AA66');//实时传输测试
      //     }, 2000);
      //     setTimeout(()=>{
      //           setInterval(function () {
      //             that.realData('A6E600123456789007FF067004F0038E02580159009C002700000027009C01590258038E04F006704878500066');//实时传输测试
      //     }, 2000);
      //   }, 1000);
      // }, 1000);


      //that.onBluetooth();
    }); //end 公用设置参数
  },
  //开始搜索附近的蓝牙设备
  onBluetooth: function (e) {
    var that = this;
    var ok = 0;
    wx.getConnectedBluetoothDevices({
      services: [that.data.uuid],
      success: function (res) {
        console.log(res)
        for(var k in res.devices){

          if(res.devices[k]==that.data.name){
            //已经连上了
            that.setData({
              deviceId: res.devices[k].deviceId
            })
            that.begin();
            ok = 1;
            break;
          }
        }
      }

    })
    if(ok!=1){
      //未连上
      wx.openBluetoothAdapter({
        success: function (res) {
          console.log(res)
          that.onBluetoothAdapterStateChange(); //监听蓝牙适配器状态变化事件
          that.getBluetoothAdapterState();
          //监听低功耗蓝牙连接状态的改变事件，包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
          wx.onBLEConnectionStateChange(function (res) {
            console.log(res)

            // 该方法回调中可以用于处理连接意外断开等异常情况
            // console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
            // wx.setStorageSync('bluetoothData','');
            // wx.setStorageSync('bluetoothDataCourse','');

            //实时上传断开重连
            if (res.connected == false) {
              that.autoLink(res.deviceId);
              wx.showToast({
                title: '断开蓝牙',
                icon: 'success',
              })
            }
          })
        },
        fail: function (err) {
          // console.log(err);
          wx.showToast({
            icon: 'none',
            duration: 2000,
            title: '初始化蓝牙失败，请检查是否开启蓝牙设备',
          })
        }
      })
    }

  },

  //断开自动重连
  autoLink: function (deviceid) {
    var that = this;
    var op = { currentTarget: { dataset: { deviceid: deviceid } } };
    wx.createBLEConnection({
      deviceId: op.currentTarget.dataset.deviceid,
      success: function (res) {
        console.log(res);

        wx.showToast({
          title: '重连成功',
          icon: 'success',
        })
        that.setData({
          addWifiPage: 2,
        });
        //获取蓝牙设备所有服务
        wx.getBLEDeviceServices({
          // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
          deviceId: op.currentTarget.dataset.deviceid,
          success: function (res) {
            console.log('device services:', res.services)
            // that.beginReturn(op);//开始实时上传
            that.begin();//开始实时上传
          }
        })
      },
    })
  },
  //关闭蓝牙模块--断开与低功耗蓝牙设备的连接
  offBluetooth: function (e) {


    wx.closeBluetoothAdapter({
      success: function (res) {
        console.log("关闭蓝牙模块")
        console.log(res)
      }
    })
  },
  //监听蓝牙适配器状态变化事件
  onBluetoothAdapterStateChange: function () {
    wx.onBluetoothAdapterStateChange(function (res) {
      console.log(`adapterState changed, now is`, res)
      var available = res.available;
      if (!available) {
        that.setData({
          switchChecked: 2
        });
        wx.showToast({
          icon: 'error',
          duration: 2000,
          title: '蓝牙已断开',
        })
      }
    })
  },
  //获取本机蓝牙适配器状态
  getBluetoothAdapterState: function () {
    var that = this;
    wx.getBluetoothAdapterState({
      success: function (res) {
        console.log(res)
        var available = res.available; //蓝牙适配器是否可用
        var discovering = res.discovering; //是否正在搜索设备

        if (!discovering) {
          that.startBluetoothDevicesDiscovery();
        }
      }
    })
  },
  //开始搜寻附近的蓝牙外围设备。注意，该操作比较耗费系统资源，请在搜索并连接到设备后调用 stop 方法停止搜索。
  startBluetoothDevicesDiscovery: function () {
    var that = this;
    wx.startBluetoothDevicesDiscovery({
      // services: [],
      success: function (res) {
        console.log(res)
        if (res.isDiscovering) {
          console.log("开始搜索设备：")
          that.getBluetoothDevices();
        }
      },
      fail: function (err) {
        console.log(err);
        wx.showToast({
          icon: 'none',
          duration: 2000,
          title: '搜寻附近的蓝牙外围设备失败',
        })
      }
    })
  },
  //获取所有已发现的蓝牙设备  
  getBluetoothDevices: function () {
    var that = this;
    var length = 0;
    var count = 0;

    var deviceslist = [];
    setTimeout(function () {
      wx.getBluetoothDevices({
        success: function (res) {
          console.log(res)
          deviceslist = res.devices
          that.createBLEConnection(deviceslist);//自动连接蓝牙
          // that.setData({
          //     list: deviceslist
          // });
        },
      })
      // wx.hideLoading()
    }, 5000) //搜寻设备5秒

  },

  //自动连接低功耗蓝牙设备  
  createBLEConnection: function (deviceslist) {
    console.log('deviceslist', deviceslist);
    var that = this;
    for (var k in deviceslist) {
      if (deviceslist[k].name == that.data.name) {

        wx.createBLEConnection({
          deviceId: deviceslist[k].deviceId,
          success: function (res) {
            wx.getBLEMTU({
              deviceId: deviceslist[k].deviceId,
              writeType: 'write',
              success(res) {
                console.log('getBLEMTU', res)
              }
            })
            setTimeout(function () {
              that.begin()
            }, 1000) //延迟时间 这里是1秒  

            console.log('这里有可能有IMEI', res);
            //获取蓝牙设备所有服务
            wx.getBLEDeviceServices({
              // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
              deviceId: deviceslist[k].deviceId,
              success: function (res) {
                console.log('device services:', res.services)
                that.setData({
                  // uuid:res.services[0].uuid,
                  deviceId: deviceslist[k].deviceId,
                });

              }
            })

          },
          fail: function (err) {
            console.log('连接失败', err);
            that.setData({
              switchChecked: 2
            });
            wx.showToast({
              icon: 'error',
              duration: 1000,
              title: '连接失败',
            })
          },
        })
        return;
      }
    }
    wx.showToast({
      icon: 'none',
      duration: 2000,
      title: '没有找到OMSAT蓝牙',
    })
    that.setData({
      switchChecked: 2
    });
    this.offBluetooth();

  },


  //向低功耗蓝牙设备特征值中写入二进制数据
  writeBLECharacteristicValue: function (cmd, hex) {
    var that = this;
    // var hex = ''
    var new_hex = 'A6' + cmd + that.data.imei.toUpperCase() + hex + util.chk8xor('A6' + cmd.toUpperCase() + hex.toUpperCase()) + '66';

    that.setData({
      log: 'imei:' + that.data.imei.toUpperCase() + 'deviceId:' + that.data.deviceId + ';serviceId:' + that.data.uuid + ';write:' + that.data.write + ';hex:' + new_hex + '校验:' + util.chk8xor('A6' + cmd.toUpperCase() + hex.toUpperCase()) + '命令字:' + cmd + '数据段:' + hex,
    })

    //样机测试
    // new_hex = 'A5098002000000';

    var buffer1 = util.hex2ab(new_hex);


    // console.log(buffer1)
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.uuid,
      characteristicId: that.data.write,
      value: buffer1,
      success: function (res) {
        // success
        console.log("success：" + util.ab2hex(buffer1) + "指令发送成功");
        // console.log(res);
        // wx.showToast({
        //   icon: 'none',
        //   duration: 1000,
        //     title: 'ok:'+util.ab2hex(buffer1),
        // })
      },
      fail: function (res) {
        // fail
        console.log(res);
        wx.showToast({
          icon: 'none',
          duration: 1000,
          title: '指令发送失败：' + res.errMsg,
        })
      },
      complete: function (res) {
        // complete
      }
    })
  },
  //启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值[注意：必须设备的特征值支持notify或者indicate才可以成功调用]
  notifyBLECharacteristicValueChange: function () {
    var that = this;
    //监听低功耗蓝牙连接状态的改变事件，包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
    wx.onBLEConnectionStateChange(function (res) {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
    })

    // 必须在这里的回调才能获取
    wx.onBLECharacteristicValueChange(function (res) {
      console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
      var val = util.ab2hex(res.value).toUpperCase();
      // console.log('接:'+val);


      wx.setStorageSync('bluetoothData', wx.getStorageSync('bluetoothData') + val);
      // that.setData({
      //   log: new Date()+'接收：'+wx.getStorageSync('bluetoothData')
      // })

      //检查帧头，是否完整数据
      that.realData(wx.getStorageSync('bluetoothData'));//应答解析
    })

    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.uuid,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: that.data.notify,
      success: function (res) {
        console.log('notifyBLECharacteristicValueChange success', res.errMsg)
      }
    })
  },

  //初始化
  begin: function (deviceid) {
    var that = this;

    //监听低功耗蓝牙连接状态的改变事件，包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
    wx.onBLEConnectionStateChange(function (res) {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
      wx.setStorageSync('bluetoothData', '');
      wx.setStorageSync('bluetoothDataCourse', '');

      // wx.setStorageSync('answerOldData','');
      that.setData({
        nextOldDataLink: '',
        answerOldData: '',
      })
      //实时上传断开重连
      if (res.connected == false) {
        that.autoLink(res.deviceId);
        wx.showToast({
          title: '断开蓝牙',
          icon: 'success',
        })
      }
    })

    // 必须在这里的回调才能获取
    wx.onBLECharacteristicValueChange(function (res) {
      console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
      // console.log(util.ab2hex(res.value))
      var val = util.ab2hex(res.value).toUpperCase();
      console.log('接收:' + val);

      // wx.setStorageSync('bluetoothData',wx.getStorageSync('bluetoothData')+val);
      // that.setData({
      //   log:new Date()+'接收：'+wx.getStorageSync('bluetoothData')
      // })

      //检查帧头，是否完整数据
      that.realData(val);//wx.getStorageSync('bluetoothData'));//应答解析
    }) //end 数据解析片段

    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.uuid,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: that.data.notify,
      success: function (res) {
        // wx.showToast({
        //     title: '开始监听',
        //     icon: 'success',
        // })
        console.log('notifyBLECharacteristicValueChange success', res.errMsg)
      }
    })
  },

  //波形+心率血压数据传输
  realData: function (data) {
    var that = this;
    // var date = parseInt(Date.parse(new Date())/1000);
    // if(wx.getStorageSync('s')==date){
    //   return;
    // }else{
    //   wx.setStorageSync('s',date);
    // }
    // if(data.indexOf('A6E6') !== 0){
    // 	wx.setStorageSync('bluetoothData','');
    // }
    if (data != '' && data.indexOf('A6E6') !== 0 && data.indexOf('66') !== -1) {
      // console.log(data,data.indexOf('A6E6'),data.indexOf('66'));
      return false;
    }

    //var data = 'A6E600DA00E800F400FD0109010F011001130116011F011B011F01270122008D00A8000000000000000000AA66';
    //A6E600123456789007FF098E0B0E0C700DA70EA50F620FD70FFE0FD70F620EA50DA70C700B0E098E4878500066
    //A6E600123456789007FF067004F0038E02580159009C002700000027009C01590258038E04F006704878500066
    var mbbData = this.data.mbbData; //16组
    var mbbDataT = this.data.mbbDataT;
    var bpmData = this.data.bpmData;

    var diastoliData = this.data.diastoliData;
    var systolicData = this.data.systolicData;
    var original = '';
    var imei = '';
    data = data.split('A6E6');
    // console.log(data);

    for (var k in data) {
      if (data[k] != '') {
        data[k] = 'A6E6' + data[k];
      }
      // console.log(data[k]);

      imei = data[k].substring(4, 16)
      // console.log(imei);

      //检查帧头，是否完整数据
      if (data[k].indexOf('A6E6') === 0) {
        var boxing_hex = data[k].substring(16, 80);
        // console.log(boxing_hex);

        original = '';


        for (var i = 0; i < 12; i++) {
          original = parseInt(boxing_hex.substring((i * 4), ((i + 1) * 4)), 16); //原始数据
          // if(original!=0){


          mbbData.push(original);
          // mbbDataT.push(mbbDataT.length+1);
          // }
          if (mbbData.length > 48) {
            mbbData.shift();
            // mbbDataT.shift();
          }
        }
        // console.log(mbbData);

        var bpm = parseInt(data[k].substring(80, 82), 16);
        var dia = parseInt(data[k].substring(82, 84), 16);
        var sys = parseInt(data[k].substring(84, 86), 16);
        bpmData.push(bpm);//心率
        diastoliData.push(dia);//收缩压
        systolicData.push(sys);//舒张压

        if (bpmData.length > 15) {
          bpmData.shift();
        }
        if (diastoliData.length > 15) {
          diastoliData.shift();
        }
        if (systolicData.length > 15) {
          systolicData.shift();
        }
      }

    }
    // console.log(hr,dis,sys);

    this.setData({
      // mbbData:mbbData,
      // mbbDataT:mbbDataT,
      // bpmData:bpmData,
      // diastoliData:diastoliData,
      // systolicData:systolicData,
      bpm: bpm,
      dia: dia,
      sys: sys,
    })

    //脉搏波图
    if (!chartMBB) {
      setTimeout(() => {
        that.ecMBBComponent.init((canvas, width, height, dpr) => {
          chartMBB = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr
          });
          setOptions.setOptionRealMbb(chartMBB, mbbData);
          return chartMBB;
        });
      }, 1000)

    } else {
      setOptions.setOptionRealMbb(chartMBB, mbbData);
    }

    //心率图
    if (!chartBPM) {
      setTimeout(() => {
        that.ecBPMComponent.init((canvas, width, height, dpr) => {
          chartBPM = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr
          });
          setOptions.setOptionRealBpm(chartBPM, bpmData);
          return chartBPM;
        });
      }, 1000)

    } else {
      setOptions.setOptionRealBpm(chartBPM, bpmData);
    }

    // 血压图
    if (!chartBP) {
      setTimeout(() => {
        that.ecBPComponent.init((canvas, width, height, dpr) => {
          chartBP = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr
          });
          setOptions.setOptionRealBP(chartBP, systolicData, diastoliData);
          return chartBP;
        });
      }, 1000)

    } else {
      setOptions.setOptionRealBP(chartBP, systolicData, diastoliData);
    }
  },







  back(e) {
    wx[e.detail]({
      url: '/pages/index/index'
    })
  },
  onShow: function () {
    this.onBluetooth();
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
  },
  // 分享接口
  onShareAppMessage: function () {
    var data = app.shareInit('chartList', 'chartList');
    console.log('分享数据：');
    console.log(data);
    util.ajax({
      url: util.config('baseApiUrl') + 'Api/User/addShareLog',
      data: data,
      success: function (res) {
        console.log('成功分享记录');
        console.log(res);
      }
    }) //end 分享记录
    return {
      // title: '非二世界，用数据构建健康世界',
      // imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
      path: data.share_true_url
    }
  }, //end 分享接口
  showEchart(e) {
    let name = e.target.dataset.type || []
    let res = !this.data[name]
    this.setData({
      [name]: res
    })
  },
  goUrl(e) {
    if (this.data.userInfo && this.data.userInfo.Wechat_xcxSetUser) {
      wx.navigateTo({
        url: e.target.dataset.url || e.currentTarget.dataset.url
      })
    } else {
      this.showLogin()
    }
  },

  //获取中医报告
  getTreport: function (DeviceIdentity) {
    var that = this;
    var DeviceIdentity = wx.getStorageSync('DeviceIdentity') || ''
    // var DeviceIdentity = 863221040319426

    that.getHR(DeviceIdentity); //获取心率
    that.getBP(DeviceIdentity); //获取血压
    that.getMBB(DeviceIdentity); //获取脉搏波
  },
  //获取血压
  getBP: function (DeviceIdentity, id) {
    this.setData({
      bpLoading: true,
    })
    var that = this;
    var data = {
      DeviceIdentity: DeviceIdentity,
      user_id: wx.getStorageSync('user_id'),
      shop_id: wx.getStorageSync('watch_shop_id'),
      date: that.data.todayDate,
      page_no: 1,
      // page_num: 5,
      select_hour: 24
    };
    if (id != undefined && id != "0" && id) {
      data.id = id;
    }

    util.ajax({
      url: util.config('baseApiUrl') + 'Api/Exercise/getBP',
      data: data,
      success: function (ress) {
        that.setData({
          bpLoading: false,
        })
        if (ress.error == 0) {
          var data = ress.data;
          var list = []
          var systolicData = []
          var diastoliData = []
          var bpDataT = []
          var diastoli = 0;
          var systolic = 0;
          var today = that.data.todayDate.replace(/-/g, '/')
          if (ress.count > 0) {
            list = data.list;
            diastoli = list[0].diastoli; //舒张压
            systolic = list[0].systolic; //收缩压

            for (var k in list) {
              if ((k % 2 == 0 && list.length >= 100) || list.length < 100) {
                // systolicData.unshift(parseInt(list[k].systolic));
                // diastoliData.unshift(parseInt(list[k].diastoli));
                // bpDataT.unshift(list[k].time);
                // systolic = list[k].systolic;
                // diastoli = list[k].diastoli;

                let arr = []
                let arr2 = []
                let arr3 = []
                let time = new Date(today + ' ' + list[k].time).getTime()
                arr.push(time)
                arr.push(list[k].systolic)
                systolicData.unshift(arr);

                arr2.push(time)
                arr2.push(list[k].diastoli)
                diastoliData.unshift(arr2);

              }
            }
          }
          that.setData({
            bp_time: data.time,
            systolic: systolic,
            diastoli: diastoli,
            systolicData: systolicData.length > 0 ? [1, 2] : [],
            diastoliData: diastoliData.length > 0 ? [1, 2] : [],

            diastoliAvg: data.avg.diastoli,
            systolicAvg: data.avg.systolic,
            bpDataT: bpDataT,
            isHideBP: true
          })
          // 血压
          if (!chartBP) {
            setTimeout(() => {
              that.ecBPComponent.init((canvas, width, height, dpr) => {
                chartBP = echarts.init(canvas, null, {
                  width: width,
                  height: height,
                  devicePixelRatio: dpr
                });
                setOptions.setOptionRealBP(chartBP, systolicData, diastoliData);
                return chartBP;
              });
            }, 1000)

          } else {
            setOptions.setOptionRealBP(chartBP, systolicData, diastoliData);
          }

        }
      },
      fail() {
        that.setData({
          bpLoading: false
        })
      }
    })
  },

  //获取心率
  getHR: function (DeviceIdentity, id) {
    this.setData({
      bpmLoading: true,
    })
    var that = this;
    var data = {
      DeviceIdentity: DeviceIdentity,
      user_id: wx.getStorageSync('user_id'),
      shop_id: wx.getStorageSync('watch_shop_id'),
      date: that.data.todayDate,
      page_no: 1,
      // page_num: 5,
      select_hour: 24
    };
    if (id != undefined && id != "0" && id) {
      data.id = id;
    }

    util.ajax({
      url: util.config('baseApiUrl') + 'Api/Exercise/getHR',
      data: data,
      success: function (ress) {
        that.setData({
          bpmLoading: false
        })
        if (ress.error == 0) {
          var data = ress.data;
          var bpmData = []
          var bpmDataT = []
          var list = []
          var bpm = 0
          var today = that.data.todayDate.replace(/-/g, '/')
          if (ress.count > 0) {
            list = data.list;
            bpm = list[0].val;
            for (var k in list) {
              // bpmData.unshift(parseInt(list[k].val));
              // bpmDataT.unshift(list[k].time);
              // bpm = list[k].val;
              if ((k % 10 == 0 && list.length >= 100) || list.length < 100) {
                let arr = []
                arr.push(new Date(today + ' ' + list[k].time).getTime())
                arr.push(list[k].val)
                bpmData.unshift(arr);
              }
            }
          }

          that.setData({
            bpmData: bpmData.length > 0 ? [1, 2] : [],
            bpmAvg: ress.data.avg,
          })
          //加载统计图
          if (!chartBPM) {
            setTimeout(() => {
              that.ecBPMComponent.init((canvas, width, height, dpr) => {
                chartBPM = echarts.init(canvas, null, {
                  width: width,
                  height: height,
                  devicePixelRatio: dpr
                });
                setOptions.setOptionRealBpm(chartBPM, bpmData);
                return chartBPM;
              });
            }, 1000)

          } else {
            setOptions.setOptionRealBpm(chartBPM, bpmData);
          }

        }
      },
      fail() {
        that.setData({
          bpmLoading: false
        })
      }
    })
  },

  //获取脉搏波
  getMBB: function (DeviceIdentity, id) {
    this.setData({
      mbbLoading: true,
    })
    var that = this;
    var data = {
      DeviceIdentity: DeviceIdentity,
      user_id: wx.getStorageSync('user_id'),
      shop_id: wx.getStorageSync('watch_shop_id'),
      date: that.data.todayDate,
      page_no: 1,
      // page_num: 5,
      select_hour: 24
    };
    if (id != undefined && id != "0" && id) {
      data.id = id;
    }

    util.ajax({
      url: util.config('baseApiUrl') + 'Api/Exercise/getHR',
      data: data,
      success: function (ress) {
        that.setData({
          mbbLoading: false
        })
        if (ress.error == 0) {
          var data = ress.data;
          var mbbData = []
          var mbbDataT = []
          var list = []
          var mbb = 0
          var today = that.data.todayDate.replace(/-/g, '/')
          if (ress.count > 0) {
            list = data.list;
            mbb = list[0].val;
            for (var k in list) {
              // mbbData.unshift(parseInt(list[k].val));
              // mbbDataT.unshift(list[k].time);
              // mbb = list[k].val;
              if ((k % 10 == 0 && list.length >= 100) || list.length < 100) {
                let arr = []
                arr.push(new Date(today + ' ' + list[k].time).getTime())
                arr.push(list[k].val)
                mbbData.unshift(arr);
              }
            }
          }

          that.setData({
            mbbData: mbbData.length > 0 ? [1, 2] : [],
            mbbAvg: ress.data.avg,
          })
          //加载统计图
          if (!chartMBB) {
            setTimeout(() => {
              that.ecMBBComponent.init((canvas, width, height, dpr) => {
                chartMBB = echarts.init(canvas, null, {
                  width: width,
                  height: height,
                  devicePixelRatio: dpr
                });
                setOptions.setOptionRealMbb(chartMBB, mbbData);
                return chartMBB;
              });
            }, 1000)

          } else {
            setOptions.setOptionRealMbb(chartMBB, mbbData);
          }

        }
      },
      fail() {
        that.setData({
          bpmLoading: false
        })
      }
    })
  },

})
