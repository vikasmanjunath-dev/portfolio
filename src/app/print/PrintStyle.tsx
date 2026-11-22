/** Print-only styling for the PDF routes: hides the site chrome and uses a plain white page. */
export default function PrintStyle() {
  return (
    <style>{`
      .nav,.dock,.grain,.cur,.cur-ring,.toast,.curtain,.foot,[class^="pre"],.skip,.aud{display:none!important}
      html,body{background:#fff!important;color:#111!important}
      @page{size:A4;margin:0}
      .pp{font:8.7pt/1.34 "Helvetica Neue",Helvetica,Arial,sans-serif;color:#111;background:#fff;width:210mm;min-height:297mm;padding:11mm 13mm;margin:0 auto;box-sizing:border-box}
      .pp h1{font:700 22pt/1.05 Georgia,serif;margin:0} .pp h2{font:700 8.4pt/1 "Helvetica Neue",Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#1f4fd8;border-bottom:1px solid #cfd6e6;padding:0 0 3px;margin:11px 0 6px}
      .pp h3{font:700 9.6pt/1.25 "Helvetica Neue",Arial,sans-serif;margin:7px 0 2px} .pp p{margin:2px 0} .pp ul{margin:2px 0 0;padding-left:14px} .pp li{margin:1.5px 0}
      .pp .psub{color:#444} .pp .prow{display:flex;justify-content:space-between;gap:10px;align-items:baseline} .pp .pdim{color:#555} .pp a{color:#1f4fd8;text-decoration:none}
      .pp .ptag{font:600 6.6pt/1 "Helvetica Neue",Arial,sans-serif;text-transform:uppercase;letter-spacing:.06em;border:1px solid #9aa6c4;border-radius:9px;padding:1px 5px;color:#35508f;white-space:nowrap}
      .pp .pgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px} .pp .pbox{border:1px solid #cfd6e6;border-radius:6px;padding:6px 7px} .pp .pbox b{display:block;font:700 12pt/1.1 Georgia,serif;color:#111}
      .pp .pchips{display:flex;flex-wrap:wrap;gap:4px} .pp .pchip{border:1px solid #cfd6e6;border-radius:5px;padding:1px 6px;font-size:8pt}
      .pp .plim{border-left:3px solid #d99a00;padding-left:8px;background:#fffaf0}
    `}</style>
  );
}
