import { APIGatewayEvent } from "aws-lambda";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import "source-map-support/register";
import chromium from "chrome-aws-lambda";

const handler = async (event: APIGatewayEvent) => {
  const executablePath = process.env.IS_OFFLINE
    ? null
    : await chromium.executablePath;
  const typeId = event.pathParameters ? event.pathParameters.typeId : "";
  const template = require("../template/pdfTemplate.pug");
  const htmlContent = template({ typeId });

  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      headless: true,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent);

    const pdfStream = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "1.5cm", right: "1.5cm", bottom: "1.5cm", left: "1.5cm" },
    });

    // "Content-Disposition": "attachment; filename=\"testing-pdf\""
    const response = {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": "application/pdf",
      },
      body: pdfStream.toString("base64"),
    };

    await browser.close();

    return response;
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};

export const generate = middy(handler).use(doNotWaitForEmptyEventLoop());
