import Editor from "../components/Editor";
import Head from "next/head";
import { NextPage } from "next";

const Homepage: NextPage = () => {
  return (
    <>
      <Head>
        <title>My page title</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Editor />
    </>
  );
};

export default Homepage;
