// 检测内网IP是否可达，如不可达则切换策略组
const targetIP = "192.168.123.1:997";
const policyGroupName = "Intranet";
const timeoutMs = 100; // 超时设置为100ms

// 获取策略组信息
let allNodes = $surge.selectGroupDetails().groups[policyGroupName];

// 先设置为第一个节点
let firstNode = allNodes[0];
$surge.setSelectGroupPolicy(policyGroupName, firstNode);
console.log(`已将节点设置为第一个: ${firstNode}`);

// 测试连通性
$httpClient.get({
  url: `http://${targetIP}`,
  timeout: timeoutMs
}, function(error, response, data) {
  if (error) {
    console.log(`${targetIP} 不可达，当前节点: ${firstNode}`);
    
    // 切换到下一个节点
    let nextNode = allNodes[1] || firstNode; // 如果只有一个节点，就保持不变
    
    // 执行切换操作
    $surge.setSelectGroupPolicy(policyGroupName, nextNode);
    
    console.log(`已切换到节点: ${nextNode}`);
  } else {
    console.log(`${targetIP} 可达，保持当前节点: ${firstNode}`);
  }
  $done();
});