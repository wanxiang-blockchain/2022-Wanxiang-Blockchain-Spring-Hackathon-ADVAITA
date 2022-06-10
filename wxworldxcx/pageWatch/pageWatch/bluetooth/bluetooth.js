import * as echarts from '../../../utils/ec-canvas/echarts';
var setOptions = require('../../../utils/setOptions.js');
var util = require('../../../utils/util.js');
var app = getApp()
var THAT = {};
var chartMBB = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    switchChecked: 0,
    addWifiPage: 0,

    name: 'OMSAT',
    uuid: '9C2C4841-69C3-4742-9F69-764351FB0783',
    write: '9C2C48A5-69C3-4742-9F69-764351FB0783',
    notify: '9C2C485A-69C3-4742-9F69-764351FB0783',

    // name:'SpO2 Watch',
    // uuid:  '6E400001-B5A3-F393-E0A9-E50E24DCCA9E',
    // write: '6E400002-B5A3-F393-E0A9-E50E24DCCA9E',
    // notify:'6E400003-B5A3-F393-E0A9-E50E24DCCA9E',

    isPass: 1,

    diastolic: '',
    systolic: '',
    acc: '',
    pass: '',
    deviceId: '',
    imei: '',

    mbbData: [],
    mbbDataT: [],

    ecMBB: {
      // 将 lazyLoad 设为 true 后，需要手动初始化图表
      disableTouch: true,
      lazyLoad: true
    },

    sexArr: ['男', '女'],
    yesOrNo: ['无', '有'],
    checkex: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    THAT = this

    this.ecMBBComponent = this.selectComponent('#mychart-dom-mbb');

    var that = this


    if (options.sn == '' || options.sn == undefined) {
      wx.showToast({
        icon: 'none',
        duration: 200000,
        title: '获取设备IMEI码失败',
      })
      that.setData({
        addWifiPage: -1,
      })
      return;
    }
    that.setData({
      imei: util.fillZero(options.sn, 12),
    })

    //公用设置参数
    app.commonInit(options, this, function (tokenInfo) {
      // that.realData('A6E600DA00E800F400FD0109010F011001130116011F011B011F01270122008D00A8000000000000000000AA66');//实时传输测试
      // setTimeout(()=>{
      //     setInterval(function () {
      //       that.realData('A6E600123456789007FF098E0B0E0C700DA70EA50F620FD70FFE0FD70F620EA50DA70C700B0E098E4878500066');//实时传输测试
      //     }, 2000);
      //     setTimeout(()=>{
      //           setInterval(function () {
      //             that.realData('A6E600123456789007FF067004F0038E02580159009C002700000027009C01590258038E04F006704878500066');//实时传输测试
      //     }, 2000);
      //   }, 1000);
      // }, 1000);

      //that.onBluetooth();

    })
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
              addWifiPage: 2,
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
      that.setData({
        switchChecked: 0
      });
      wx.openBluetoothAdapter({
        success: function (res) {
          console.log(res)
          that.onBluetoothAdapterStateChange(); //监听蓝牙适配器状态变化事件
          that.getBluetoothAdapterState();
          //监听低功耗蓝牙连接状态的改变事件，包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
          wx.onBLEConnectionStateChange(function (res) {
            // 该方法回调中可以用于处理连接意外断开等异常情况
            console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
            // wx.setStorageSync('bluetoothData','');
            // wx.setStorageSync('bluetoothDataCourse','');

            //实时上传断开重连
            if (res.connected == false) {
              that.autoLink(res.deviceId);
              wx.showToast({
                title: '断开蓝牙',
                icon: 'success',
              })
              that.setData({
                switchChecked: 2,
                addWifiPage: 0,
              });
            }
          })
          // that.setData({
          //     switchChecked: 1
          // });
        },
        fail: function (err) {
          that.setData({
            switchChecked: 2
          });
          console.log(err);
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
autoLink: function(deviceid) {
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
offBluetooth: function(e) {


  wx.closeBluetoothAdapter({
    success: function (res) {
      console.log("关闭蓝牙模块")
      console.log(res)
    }
  })
},
//监听蓝牙适配器状态变化事件
onBluetoothAdapterStateChange: function() {
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
getBluetoothAdapterState: function() {
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
startBluetoothDevicesDiscovery: function() {
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
getBluetoothDevices: function() {
  var that = this;
  var length = 0;
  var count = 0;
  // wx.showLoading({
  //     title: '加载中',
  //     mask: true
  // })
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
    wx.hideLoading()
  }, 5000) //搜寻设备5秒

},

//自动连接低功耗蓝牙设备  
createBLEConnection: function(deviceslist) {
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
                switchChecked: 1,
                // uuid:res.services[0].uuid,
                deviceId: deviceslist[k].deviceId,
              });
              // that.setData({
              //     ServiceConnected: res.services,
              //     ServiceDisplay: "block"
              // });
              setTimeout(function () {
                that.setData({
                  addWifiPage: 2
                });
              }, 2000) //2秒后
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
            duration: 2000,
            title: '连接失败',
          })
        },
      })
      return;
    }
  }
  wx.showToast({
    icon: 'none',
    duration: 3000,
    title: '没有找到OMSAT蓝牙',
  })
  that.setData({
    switchChecked: 2
  });
  this.offBluetooth();

},


//向低功耗蓝牙设备特征值中写入二进制数据
writeBLECharacteristicValue: function(cmd, hex) {
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
      wx.showToast({
        icon: 'none',
        duration: 2000,
        title: 'ok:' + util.ab2hex(buffer1),
      })
    },
    fail: function (res) {
      // fail
      console.log(res);
      wx.showToast({
        icon: 'none',
        duration: 2000,
        title: '指令发送失败：' + res.errMsg,
      })
    },
    complete: function (res) {
      // complete
    }
  })
},
//启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值[注意：必须设备的特征值支持notify或者indicate才可以成功调用]
notifyBLECharacteristicValueChange: function() {
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


    // wx.setStorageSync('bluetoothData',wx.getStorageSync('bluetoothData')+val);
    that.setData({
      log: new Date() + '接收：' + wx.getStorageSync('bluetoothData')
    })

    //检查帧头，是否完整数据
    that.realData(val);//wx.getStorageSync('bluetoothData'));//应答解析
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
begin: function(deviceid) {
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
    // console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
    // console.log(util.ab2hex(res.value))
    var val = util.ab2hex(res.value).toUpperCase();
    // console.log('接收:'+val);

    // wx.setStorageSync('bluetoothData',wx.getStorageSync('bluetoothData')+val);
    that.setData({
      log: new Date() + '接收：' + wx.getStorageSync('bluetoothData')
    })

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









diastolicInput(e){
  this.setData({
    diastolic: e.detail.value,
  })
},
systolicInput(e){
  this.setData({
    systolic: e.detail.value,
  })
},

accInput(e){
  this.setData({
    acc: e.detail.value,
    check: (e.detail.value != '' && this.data.isPass == 0 || (this.data.isPass == 1 && this.data.pass != '')),
  })
},
passInput(e){
  this.setData({
    pass: e.detail.value,
    check: (this.data.acc != '' && this.data.isPass == 0 || (this.data.isPass == 1 && e.detail.value != '')),
  })
},
isPass(){
  if (this.data.isPass == 0) {
    this.setData({
      isPass: 1,
      check: (this.data.acc != '' && this.data.pass != ''),
    })
  } else {
    this.setData({
      isPass: 0,
      check: (this.data.acc != ''),
    })
  }

},
//添加WiFi
confirm: function() {
  var that = this;

  var hex = '';

  var acc = that.data.acc;
  var pass = that.data.isPass == 1 ? that.data.pass : '';

  var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
  if (reg.test(acc)) {
    wx.showToast({
      icon: 'none',
      duration: 2000,
      title: '账号名不能包含中文',
    })
    return;
  }

  var acc_hex = util.ascii2Hex(acc);
  var pass_hex = util.ascii2Hex(pass);

  var acc_hex_len = util.fillZero(Math.ceil((acc_hex.length / 2)).toString(16), 2);
  var pass_hex_len = util.fillZero(Math.ceil((pass_hex.length / 2)).toString(16), 2);
  // console.log(acc_hex_len,pass_hex_len)

  acc_hex = acc_hex_len + acc_hex;
  pass_hex = pass_hex_len + pass_hex;

  hex = acc_hex + pass_hex;
  console.log(hex)


  //获取蓝牙特征值
  wx.getBLEDeviceCharacteristics({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: that.data.deviceId,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: that.data.uuid,
    success: function (res) {
      console.log('device getBLEDeviceCharacteristics:', res.characteristics)

      that.setData({
        log: 'deviceId:' + that.data.deviceId + ';serviceId:' + that.data.uuid + ';characteristics' + res.characteristics,
      })

      // that.begin(that.data.deviceId);//蓝牙开始工作

      // that.setData({
      //     CharacteristicConnected: res.characteristics,
      // })
      that.notifyBLECharacteristicValueChange();//监听
      that.writeBLECharacteristicValue('E1', hex);//写入WiFi

      wx.showToast({
        icon: 'none',
        duration: 5000,
        title: ' 添加WiFi成功',
      })

      setTimeout(function () {
        that.setData({
          addWifiPage: 2,//测试用
        })
        // wx.redirectTo({
        //   url: '/pages/index/index'
        // })
      }, 5000);
    },
    fail: function (res) {
      // fail
      console.log('getBLEDeviceCharacteristics:fail');
      console.log(res);
      wx.showToast({
        icon: 'none',
        duration: 2000,
        title: '获取characteristic失败',
      })
    },
  })
},


//更新当前时间
updateTime: function() {
  var that = this;

  var hex = Date.parse(new Date()) + '';
  hex = parseInt(hex.substr(0, hex.length - 3));
  hex = hex.toString(16)
  console.log(hex)


  //获取蓝牙特征值
  wx.getBLEDeviceCharacteristics({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: that.data.deviceId,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: that.data.uuid,
    success: function (res) {
      console.log('device getBLEDeviceCharacteristics:', res.characteristics)

      that.setData({
        log: 'deviceId:' + that.data.deviceId + ';serviceId:' + that.data.uuid + ';characteristics' + res.characteristics,
      })

      // that.begin(that.data.deviceId);//蓝牙开始工作

      // that.setData({
      //     CharacteristicConnected: res.characteristics,
      // })
      that.notifyBLECharacteristicValueChange();//监听
      that.writeBLECharacteristicValue('A1', hex);//写入

      wx.showToast({
        icon: 'none',
        duration: 2000,
        title: '更新当前时间成功',
      })
    },
    fail: function (res) {
      // fail
      console.log('getBLEDeviceCharacteristics:fail');
      console.log(res);
      wx.showToast({
        icon: 'none',
        duration: 2000,
        title: '获取characteristic失败',
      })
    },
  })
},

//血压校准
calibration: function() {
  var that = this;

  var hex = util.fillZero(parseInt(that.data.systolic).toString(16), 2) + util.fillZero(parseInt(that.data.diastolic).toString(16), 2);
  console.log(hex)

  //获取蓝牙特征值
  wx.getBLEDeviceCharacteristics({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: that.data.deviceId,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: that.data.uuid,
    success: function (res) {
      console.log('device getBLEDeviceCharacteristics:', res.characteristics)

      that.setData({
        log: 'deviceId:' + that.data.deviceId + ';serviceId:' + that.data.uuid + ';characteristics' + res.characteristics,
      })

      // that.begin(that.data.deviceId);//蓝牙开始工作

      // that.setData({
      //     CharacteristicConnected: res.characteristics,
      // })
      that.notifyBLECharacteristicValueChange();//监听
      that.writeBLECharacteristicValue('E0', hex);//写入

      wx.showToast({
        icon: 'none',
        duration: 2000,
        title: '血压校准成功',
      })
    },
    fail: function (res) {
      // fail
      console.log('getBLEDeviceCharacteristics:fail');
      console.log(res);
      wx.showToast({
        icon: 'none',
        duration: 2000,
        title: '获取characteristic失败',
      })
    },
  })
},

//删除WiFi
deleteWifi: function() {
  var that = this;

  var hex = '01';
  console.log(hex);

  //获取蓝牙特征值
  wx.getBLEDeviceCharacteristics({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: that.data.deviceId,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: that.data.uuid,
    success: function (res) {
      console.log('device getBLEDeviceCharacteristics:', res.characteristics)

      that.setData({
        log: 'deviceId:' + that.data.deviceId + ';serviceId:' + that.data.uuid + ';characteristics' + res.characteristics,
      })

      // that.begin(that.data.deviceId);//蓝牙开始工作

      // that.setData({
      //     CharacteristicConnected: res.characteristics,
      // })
      that.notifyBLECharacteristicValueChange();//监听
      that.writeBLECharacteristicValue('E2', hex);//写入

      wx.showToast({
        icon: 'none',
        duration: 2000,
        title: '删除WiFi成功',
      })
    },
    fail: function (res) {
      // fail
      console.log('getBLEDeviceCharacteristics:fail');
      console.log(res);
      wx.showToast({
        icon: 'none',
        duration: 2000,
        title: '获取characteristic失败',
      })
    },
  })
},

//删除全部WiFi
deleteAllWifi: function() {
  var that = this;

  var hex = '';

  //获取蓝牙特征值
  wx.getBLEDeviceCharacteristics({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: that.data.deviceId,
    // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
    serviceId: that.data.uuid,
    success: function (res) {
      console.log('device getBLEDeviceCharacteristics:', res.characteristics)

      that.setData({
        log: 'deviceId:' + that.data.deviceId + ';serviceId:' + that.data.uuid + ';characteristics' + res.characteristics,
      })

      // that.begin(that.data.deviceId);//蓝牙开始工作

      // that.setData({
      //     CharacteristicConnected: res.characteristics,
      // })
      that.notifyBLECharacteristicValueChange();//监听
      that.writeBLECharacteristicValue('E3', hex);//写入

      wx.showToast({
        icon: 'none',
        duration: 2000,
        title: '删除全部WIFI成功',
      })
    },
    fail: function (res) {
      // fail
      console.log('getBLEDeviceCharacteristics:fail');
      console.log(res);
      wx.showToast({
        icon: 'none',
        duration: 2000,
        title: '获取characteristic失败',
      })
    },
  })
},

//波形+心率血压数据传输
realData: function(data) {
  var that = this;

  // if(data.indexOf('A6E6') !== 0){
  //   wx.setStorageSync('bluetoothData','');
  // }
  if (data != '' && data.indexOf('A6E6') !== 0 && data.indexOf('66') !== -1) {
    console.log(data, data.indexOf('A6E6'), data.indexOf('66'));
    return false;
  }

  //var data = 'A6E600DA00E800F400FD0109010F011001130116011F011B011F01270122008D00A8000000000000000000AA66';
  //A6E600123456789007FF098E0B0E0C700DA70EA50F620FD70FFE0FD70F620EA50DA70C700B0E098E4878500066
  //A6E600123456789007FF067004F0038E02580159009C002700000027009C01590258038E04F006704878500066
  var mbbData = this.data.mbbData; //16组
  var mbbDataT = this.data.mbbDataT;
  var hr = [];
  var dis = [];
  var sys = [];
  var original = '';
  var imei = '';
  data = data.split('A6E6');
  console.log(data);

  for (var k in data) {
    if (data[k] != '') {
      data[k] = 'A6E6' + data[k];
    }
    console.log(data[k]);

    imei = data[k].substring(4, 16)
    console.log(imei);

    //检查帧头，是否完整数据
    if (data[k].indexOf('A6E6') === 0) {
      var boxing_hex = data[k].substring(16, 80);
      // console.log(boxing_hex);

      original = '';


      for (var i = 0; i < 16; i++) {
        original = parseInt(boxing_hex.substring((i * 4), ((i + 1) * 4)), 16); //原始数据
        mbbData.push(original);
        mbbDataT.push(mbbDataT.length + 1);

        if (mbbData.length > 128) {
          mbbData.shift();
          mbbDataT.shift();
        }
      }
      // console.log(mbbData);


      hr.push(parseInt(data[k].substring(80, 82), 16));//心率
      dis.push(parseInt(data[k].substring(82, 84), 16));//收缩压
      sys.push(parseInt(data[k].substring(84, 86), 16));//舒张压
    }

  }
  // console.log(hr,dis,sys);

  this.setData({
    // mbbData:mbbData,
    // mbbDataT:mbbDataT,
    log: '脉搏波：' + JSON.stringify(mbbData) + '心率：' + JSON.stringify(hr) + '收缩压：' + JSON.stringify(dis) + '舒张压：' + JSON.stringify(sys)
  })


  //脉搏波图
  // if(!chartMBB){
  //   setTimeout(()=>{
  //     that.ecMBBComponent.init((canvas, width, height,dpr) => {
  //       chartMBB = echarts.init(canvas, null, {
  //         width: width,
  //         height: height,
  //         devicePixelRatio: dpr
  //       });
  //       setOptions.setOptionMbb(chartMBB, mbbData);
  //       return chartMBB;
  //     });
  //   },1000)

  // }else{
  //   setOptions.setOptionMbb(chartMBB, mbbData);
  // }
},

linkWifi(){
  var that = this;
  this.setData({
    addWifiPage: 1,

  })



  if (that.data.isIos) {
    that.setData({
      wifiList: [],
      isShowWifiList: 0,
    })

  } else {
    that.setData({
      isShowWifiList: 1,
      wifiList: []
    })
    wx.showLoading({
      title: '搜索WiFi中',
    })
    wx.startWifi({
      success(res1) {
        console.log(res1);
        wx.getWifiList({
          success(res2) {
            console.log(res2);
            wx.onGetWifiList((result) => {
              console.log(result);
              wx.hideLoading();
              that.setData({
                wifiList: result.wifiList.filter((item) => {
                  return item.SSID && item.secure
                })
              })
            })
          },
          fail(res) {
            console.log(res);
            app.alert_s(res.errMsg, that);
            wx.hideLoading();
          }
        })
      },
      fail(res) {
        console.log(res);
        app.alert_s(res.errMsg, that);
        wx.hideLoading();
      }
    })
  }
},
selectWifi(e){
  this.setData({
    acc: e.currentTarget.dataset.name,
    isShowWifiList: 0,
  })
},
goChat(){
  wx.previewImage({
    current: 'https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png',
    urls: ['https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png']
  })
},
goRealTimeChart(e){
  console.log(e)
  // this.offBluetooth();
  wx.navigateTo({
    url: '/pageWatch/pageWatch/realTimeChart/realTimeChart?device_id=' + this.data.imei,
  });

},

bindFormChange: function(e) {
  // console.log( e)
  // console.log('picker发送选择改变，携带值为', e.detail.value)
  var addData = {};
  addData[e.target.dataset.key] = e.detail.value;
  // console.log(addData)
  this.setData(addData)
  this.checkNext();
},

otherChange: function(e) {
  // console.log(e)

  var checkex = this.data.checkex;

  if (e.currentTarget.dataset.index == 0) {
    checkex = [checkex[0]]
  } else {
    checkex[0] = '';
  }
  if (checkex[e.currentTarget.dataset.index] == e.currentTarget.dataset.text) {
    checkex[e.currentTarget.dataset.index] = '';
  } else {
    checkex[e.currentTarget.dataset.index] = e.currentTarget.dataset.text;
  }

  var otherbing = '';
  for (var k in checkex) {
    if (checkex[k] != '') {
      otherbing = otherbing + checkex[k] + ',';
    }
  }
  if (otherbing == '') {
    checkex = [];
  }

  this.setData({ checkex: checkex, otherbing: otherbing });
  this.checkNext();
},

//确认下一步
checkNext: function() {
  if (this.data.sex != undefined && this.data.birth != undefined && this.data.cm != undefined && this.data.kg != undefined) {
    this.setData({
      check: 1,
    })
  } else {
    this.setData({
      check: 0,
    })
  }

  if (this.data.gaoxueya != undefined && this.data.tangniaobing != undefined && this.data.guanxinbing != undefined && this.data.checkex != undefined && this.data.checkex.length > 0) {
    this.setData({
      check: 2,
    })
  }
},
//下一步
confirm2: function() {
  if (this.data.check == 1) {
    this.setData({
      switchChecked: 4,
      addWifiPage: 3,
      check: 0,
    })
  }
},
//提交信息
confirm3: function() {
  if (this.data.check != 2) {
    return false;
  }
  var that = this;
  this.setData({
    check: 3,
  })

  util.ajax({
    url: util.config('baseApiUrl') + 'Api/Exercise/updateTreportUser',
    data: {
      user_id: wx.getStorageSync('user_id'),
      shop_id: 25,
      sex: parseInt(parseInt(that.data.sex) + 1),
      weight: that.data.kg,
      height: that.data.cm,
      birth_day: that.data.birth,
      gaoxueya: that.data.gaoxueya,
      tangniaobing: that.data.tangniaobing,
      guanxinbing: that.data.guanxinbing,
      otherbing: that.data.otherbing,
    },
    success: function (res) {
      if (res.error == 0) {
        wx.showToast({
          title: '保存成功',
          icon: 'none',
          duration: 2000
        });
        //跳转页面
        setTimeout(function () {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }, 2000)
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        });
      }
    },
    complete: function () {
      this.setData({
        check: 2,
      })
    }
  })

},
/**
 * 生命周期函数--监听页面初次渲染完成
 */
onReady: function () {

},

/**
 * 生命周期函数--监听页面显示
 */
onShow: function () {
  this.onBluetooth();
  // console.log(util.ascii2Hex('01234"; @'));
  //AA5504B10000
  //01A07CFF02
  //['AA','55','04','B1','00','00']
  // console.log(util.chk8xor('01A07CFF02'));

},

/**
 * 生命周期函数--监听页面隐藏
 */
onHide: function () {

},

/**
 * 每当小程序可能被销毁之前，页面回调函数 onSaveExitState 会被调用
 */
onSaveExitState: function () {
  this.offBluetooth();
},

/**
 * 页面相关事件处理函数--监听用户下拉动作
 */
onPullDownRefresh: function () {

},

/**
 * 页面上拉触底事件的处理函数
 */
onReachBottom: function () {

},

/**
 * 用户点击右上角分享
 */
onShareAppMessage: function () {

}
})

