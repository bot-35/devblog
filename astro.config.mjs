import { defineConfig } from 'astro/config';
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import { listDraftBlogPosts } from "/src/scripts/listDraftPostsBlog";

const blogDrafts = await listDraftBlogPosts();

import { remarkReadingTime } from './remark-reading-time.mjs';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeToc from '@jsdevtools/rehype-toc';
import rehypeClassNames from 'rehype-class-names';

// https://astro.build/config
export default defineConfig({
    markdown: {
      shikiConfig: { 
        wrap: true,
      },
      remarkPlugins: [remarkReadingTime],
      rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, {
        behavior: 'append'
      }], [rehypeToc, {
        headings: ["h2", "h3"],
        position: "afterend"
      }], [rehypeClassNames, {
        'p': '',
        'h1': '',
        'h2': '',
        'h3': '',
        'h4': '',
        'h5': '',
        'li': '',
        'blockquote': ''
      }]]
    },
    site: 'https://blog.maximebourdon.fr',
    integrations: [tailwind({
      config: {
        applyBaseStyles: false
      }
    }), mdx({
      shikiConfig: { 
        wrap: true,
      },
      remarkPlugins: [remarkReadingTime],
      rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, {
        behavior: 'append'
      }], [rehypeToc, {
        headings: ["h2", "h3"],
        position: "afterend"
      }], [rehypeClassNames, {
        'p': '',
        'h1': '',
        'h2': '',
        'h3': '',
        'h4': '',
        'h5': '',
        'li': '',
        'blockquote': ''
      }]]
    }), sitemap({
      filter: page => {
      let include = true
      let slug = page.split('https://blog.maximebourdon.fr/posts/').pop().slice(0, -1);
    
      const isDraftBlogPostPage = Boolean(blogDrafts.find(fileName => fileName.split('.mdx')[0] === slug));
      
      if (isDraftBlogPostPage) {
          console.log(`⛔️ "${page}" has been excluded from the sitemap`)
          include = false
      }
  
      return include
      },
  }), icon()]
  });