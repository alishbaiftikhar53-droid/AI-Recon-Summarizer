export function printReportPdf(html: string): void {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
  frame.onload = () => {
    const frameWindow = frame.contentWindow;
    if (!frameWindow) {
      frame.remove();
      return;
    }
    frameWindow.onafterprint = () => frame.remove();
    frameWindow.focus();
    frameWindow.print();
  };
  frame.srcdoc = html;
  document.body.appendChild(frame);
}
