// 检测内网IP是否可达，如不可达则切换策略组
const targetIP = "192.168.123.99";
const policyGroupName = "Intranet";
const timeoutSeconds = 2; // 超时设置为2秒

// 使用$httpClient.get尝试ping目标IP
$httpClient.get({
  url: `http://${targetIP}`,
  timeout: timeoutSeconds * 1000 // 转换为毫秒
}, function(error, response, data) {
  if (error) {
    console.log(`${targetIP} 不可达，切换到下一个节点`);
    // 获取当前策略组信息
    $surge.setSelectGroupPolicy(policyGroupName, "NEXT");
    $done();
  } else {
    console.log(`${targetIP} 可达，保持当前节点`);
    $done();
  }
});