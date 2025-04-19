// 检测内网IP是否可达，如不可达则使用测速选择最佳节点
const targetIP = "192.168.123.99";
const policyGroupName = "Intranet";
const timeoutSeconds = 2; // 超时设置为2秒
const testTimeout = 5; // 测速超时时间(秒)

// 获取当前策略组信息
let currentNode = $surge.selectGroupDetails().decisions[policyGroupName];
let allNodes = $surge.selectGroupDetails().groups[policyGroupName];

// 检测目标IP是否可达
$httpClient.get({
  url: `http://${targetIP}`,
  timeout: timeoutSeconds * 1000 // 转换为毫秒
}, function(error, response, data) {
  if (error) {
    console.log(`${targetIP} 不可达，当前节点: ${currentNode}，开始测速选择最佳节点...`);
    
    // 开始对所有节点进行测速
    testAllNodes(allNodes, 0, []);
  } else {
    console.log(`${targetIP} 可达，保持当前节点: ${currentNode}`);
    $done();
  }
});

// 递归函数：测试所有节点速度
function testAllNodes(nodes, index, results) {
  if (index >= nodes.length) {
    // 所有节点测试完毕，选择最佳节点
    selectBestNode(results);
    return;
  }
  
  let nodeName = nodes[index];
  console.log(`测试节点 ${nodeName} 的速度...`);
  
  // 先切换到该节点
  $surge.setSelectGroupPolicy(policyGroupName, nodeName);
  
  // 等待切换生效
  setTimeout(function() {
    // 进行速度测试
    $network.speedtest({
      timeout: testTimeout * 1000,
      url: `http://${targetIP}`
    }, function(error, data) {
      let result = {
        node: nodeName,
        success: !error,
        time: error ? Infinity : data.time, // 连接时间(毫秒)
      };
      
      console.log(`节点 ${nodeName} 测速结果: ${result.success ? result.time + 'ms' : '失败'}`);
      results.push(result);
      
      // 测试下一个节点
      testAllNodes(nodes, index + 1, results);
    });
  }, 1000); // 等待1秒让节点切换生效
}

// 选择最佳节点
function selectBestNode(results) {
  // 过滤出测速成功的节点
  let successResults = results.filter(r => r.success);
  
  if (successResults.length === 0) {
    console.log("没有可用节点能连接到目标IP，保持当前节点");
    $done();
    return;
  }
  
  // 按响应时间排序
  successResults.sort((a, b) => a.time - b.time);
  
  // 选择响应最快的节点
  let bestNode = successResults[0].node;
  console.log(`选择最佳节点: ${bestNode}，响应时间: ${successResults[0].time}ms`);
  
  // 切换到最佳节点
  $surge.setSelectGroupPolicy(policyGroupName, bestNode);
  $done();
}