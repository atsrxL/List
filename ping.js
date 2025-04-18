// 检测内网IP是否可达，如不可达则切换策略组
const targetIP = "192.168.123.1:997";
const policyGroupName = "Intranet";
const timeoutSeconds = 2; // 超时设置为2秒

// 获取当前策略组信息
let currentNode = $surge.selectGroupDetails().decisions[policyGroupName];
let allNodes = $surge.selectGroupDetails().groups[policyGroupName];

$httpClient.get({
  url: `http://${targetIP}`,
  timeout: timeoutSeconds * 1000 // 转换为毫秒
}, function(error, response, data) {
  if (error) {
    console.log(`${targetIP} 不可达，当前节点: ${currentNode}`);
    
    // 找到当前节点在列表中的位置
    let currentIndex = allNodes.indexOf(currentNode);
    let nextIndex = (currentIndex + 1) % allNodes.length;
    let nextNode = allNodes[nextIndex];
    
    // 实际执行切换操作
    $surge.setSelectGroupPolicy(policyGroupName, nextNode);
    
    console.log(`已切换到节点: ${nextNode}`);
    $done();
  } else {
    console.log(`${targetIP} 可达，保持当前节点: ${currentNode}`);
    $done();
  }
});