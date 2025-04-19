// 检测内网IP是否可达，如不可达则切换策略组
const targetIP = "192.168.123.99";
const policyGroupName = "Intranet";
const timeoutSeconds = 2; // 超时设置为2秒

// 获取当前策略组信息
let currentNode = $surge.selectGroupDetails().decisions[policyGroupName];
let allNodes = $surge.selectGroupDetails().groups[policyGroupName];

// 使用ping命令检测目标IP是否可达
let startTime = new Date().getTime();
$httpClient.get({
  url: `http://${targetIP}`,
  timeout: timeoutSeconds * 1000 // 转换为毫秒
}, function(error, response, data) {
  let endTime = new Date().getTime();
  let pingLatency = error ? "超时" : `${endTime - startTime}ms`;
  
  if (error) {
    console.log(`${targetIP} 不可达，当前节点: ${currentNode}, 测试延迟: ${pingLatency}`);
    
    // 找到当前节点在列表中的位置
    let currentIndex = allNodes.indexOf(currentNode);
    let nextIndex = (currentIndex + 1) % allNodes.length;
    let nextNode = allNodes[nextIndex];
    
    // 实际执行切换操作
    $surge.setSelectGroupPolicy(policyGroupName, nextNode);
    
    console.log(`已切换到下一个节点: ${nextNode}`);
    $done();
  } else {
    console.log(`${targetIP} 可达，保持当前节点: ${currentNode}, 测试延迟: ${pingLatency}`);
    $done();
  }
});