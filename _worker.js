export default {
  async fetch(request) {
    let url = new URL(request.url);
    
    // 将当前页面的域名替换为目标域名 pomf2.lain.la
    let targetUrl = new URL(request.url.replace(url.hostname, 'pomf2.lain.la'));

    // 保留原始请求的所有方法和头部
    let modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    });

    // 发出代理请求
    let response = await fetch(modifiedRequest);

    // 获取响应的内容类型
    let contentType = response.headers.get('Content-Type') || '';

    // 处理 HTML 和 JavaScript 文件
    if (contentType.includes('text/html') || contentType.includes('application/javascript')) {
      let text = await response.text();

      // 将所有 pomf2.lain.la 替换为当前访问的域名
      let updatedText = text.replace(/pomf2\.lain\.la/g, url.hostname);

      // 返回替换后的 HTML 或 JS
      return new Response(updatedText, {
        headers: {
          'Content-Type': contentType,           // 保持原始的内容类型
          'Access-Control-Allow-Origin': '*',    // 允许跨域
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
        status: response.status,
        statusText: response.statusText
      });
    }

    // 处理音频/视频文件，确保流式传输
    if (contentType.includes('video') || contentType.includes('audio')) {
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Accept-Ranges', 'bytes');  // 支持 Range 请求

      return new Response(response.body, {
        headers: headers,
        status: response.status,
        statusText: response.statusText
      });
    }

    // 处理 JSON 文件，替换其中的 pomf2.lain.la 链接
    if (contentType.includes('application/json')) {
      let json = await response.json();
      let jsonString = JSON.stringify(json);

      // 替换 JSON 中的 URL 链接
      let updatedJsonString = jsonString.replace(/pomf2\.lain\.la/g, url.hostname);

      return new Response(updatedJsonString, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
        status: response.status,
        statusText: response.statusText
      });
    }

    // 处理 CSS、图片等静态资源
    return new Response(response.body, {
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',  // 允许跨域
      },
      status: response.status,
      statusText: response.statusText
    });
  }
}
