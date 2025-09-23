import { defineConfig } from 'astro/config';
import sitemap from "@astrojs/sitemap";
import tailwind from '@tailwindcss/vite';
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import { listDraftBlogPosts } from "/src/scripts/listDraftPostsBlog";

const blogDrafts = await listDraftBlogPosts();

import { remarkGitHubLink } from './src/plugins/remark-github-link.mjs';
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs';

import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeToc from '@jsdevtools/rehype-toc';
import rehypeClassNames from 'rehype-class-names';


// https://astro.build/config
export default defineConfig({
  // 👇 ICI : on limite ce que Vite/Astro surveille
  vite: {
    plugins: [tailwind()],        // ✅ ← ICI, pas dans `integrations`
    server: {
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.astro/**',
          '**/dist/**',
          '**/.git/**'
          // ajoute d'autres répertoires lourds si besoin :
          // '**/public/generated/**',
          // '**/backups/**',
        ],
      },
      // (optionnel) utile sur lecteurs/réseaux capricieux
      // fs: { strict: true },
    },
  },

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

  site: 'https://devblog-bot-35.vercel.app/devblog/',

  integrations: [
    mdx({
    shikiConfig: { 
      wrap: true,
    },
    remarkPlugins: 
    [[remarkReadingTime],       
    [remarkGitHubLink, {}],],
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
    let slug = page.split('https://devblog-bot-35.vercel.app/devblog/posts/').pop().slice(0, -1);
  
    const isDraftBlogPostPage = Boolean(blogDrafts.find(fileName => fileName.split('.mdx')[0] === slug));
    
    if (isDraftBlogPostPage) {
        console.log(`⛔️ "${page}" has been excluded from the sitemap`)
        include = false
    }

    return include
    },
}), icon()]});