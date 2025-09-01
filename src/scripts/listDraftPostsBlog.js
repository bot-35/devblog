import fs from "fs";
import path from "path";
import matter from "gray-matter";

async function readBlogDirectory(directory) {
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return readBlogDirectory(entryPath);
      } else {
        return entryPath;
      }
    })
  );

  return Array.prototype.concat(...files);
}

async function isDraftPage(pagePath) {
  const content = await fs.promises.readFile(pagePath, "utf8");
  const { data } = matter(content);
  return data.draft === true;
}

async function getSlug(pagePath) {
  const content = await fs.promises.readFile(pagePath, "utf8");
  const { data } = matter(content);
  return data.slug;
}

export async function listDraftBlogPosts() {
  const drafts = [];
  const blogDirectory = "./src/content/posts";
  const blogFiles = await readBlogDirectory(blogDirectory);

  const mdxFiles = blogFiles.filter((file) => {
    return file.endsWith(".mdx");
  });

  for (const mdxFile of mdxFiles) {
    if (await isDraftPage(mdxFile)) {
      let slug = await getSlug(mdxFile);
      drafts.push(slug + '.mdx');
    }
  }
  return drafts;
}


