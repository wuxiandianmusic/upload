export default {
  async fetch(request) {
    let url = new URL(request.url);

    // 获取当前请求的域名，并替换目标 URL 中的域名
    let targetUrl = new URL(request.url.replace(url.hostname, 'files.catbox.moe'));

    // 使用 fetch 将请求转发到目标服务器
    let modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow',
    });

    // 获取目标服务器的响应
    let response = await fetch(modifiedRequest);

    // 将响应体中的 URL 替换回当前页面的域名
    let modifiedResponse = new Response(response.body, response);
    let text = await modifiedResponse.text();
    let updatedText = text.replace(/files\.catbox\.moe/g, url.hostname);

    // 返回修改后的响应
    return new Response(updatedText, {
      headers: modifiedResponse.headers,
      status: modifiedResponse.status,
      statusText: modifiedResponse.statusText,
    });
  }
}
