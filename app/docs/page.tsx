import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Layers, FileText, MessageSquare, Upload, Database,
    Cpu, Shield, Zap, AlertTriangle, Lightbulb, GitBranch, ArrowRight
} from "lucide-react";

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Layers className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold text-lg">Unravel</span>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to App
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Title Section */}
                <div className="mb-16">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-4">
                        Case Study
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Building Unravel: A Full-Stack RAG Application
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        A detailed look at building a document assistant powered by LlamaCloud, routed through OpenRouter, and backed by Supabase.
                    </p>
                </div>

                <div className="space-y-16">
                    {/* Project Overview */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-500" />
                            </div>
                            Project Overview
                        </h2>
                        <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <p>
                                <strong>Unravel</strong> is a document interaction platform that leverages Retrieval-Augmented Generation (RAG) to allow users to "chat" with their documents. Unlike traditional search, Unravel understands context and nuance, providing conversational answers cited directly from user-uploaded files.
                            </p>
                            <p className="mt-4">
                                The application was built to demonstrate modern AI engineering practices, robust vector search implementation, and seamless real-time user experiences using the latest web technologies.
                            </p>
                        </div>
                    </section>

                    {/* Problem Statement */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            Problem Statement
                        </h2>
                        <div className="bg-muted/50 rounded-xl p-8 border border-border">
                            <p className="text-lg font-medium mb-4">The Information Retrieval Gap</p>
                            <p className="text-muted-foreground mb-4">
                                Knowledge workers spend approximately 20% of their time searching for internal information. Traditional keyword search often fails to capture semantic meaning (e.g., searching for "revenue growth" might miss documents mentioning "increased sales").
                            </p>
                            <p className="text-muted-foreground">
                                <strong>The Challenge:</strong> How do we build a system that allows users to query complex documents using natural language and receive accurate, hallucination-free answers with precise citations?
                            </p>
                        </div>
                    </section>

                    {/* Key Features */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-purple-500" />
                            </div>
                            Key Features
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FeatureCard
                                title="Semantic Document Search"
                                description="Uses vector embeddings to understand the meaning behind queries, not just keyword matching."
                            />
                            <FeatureCard
                                title="Context-Aware Citations"
                                description="Every answer includes citations pointing to the exact source document"
                            />
                            <FeatureCard
                                title="Project Workspaces"
                                description="Isolate documents into logical projects (e.g., 'Financial Reports', 'Legal Contracts')."
                            />
                            <FeatureCard
                                title="Multi-Format Support"
                                description="Ingests PDF, DOCX, XLSX, CSV, JSON, Markdown, and TXT with specialized parsing pipelines."
                            />
                        </div>
                    </section>

                    {/* System Architecture */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <Cpu className="w-5 h-5 text-orange-500" />
                            </div>
                            System Architecture
                        </h2>
                        <div className="space-y-6">
                            <p className="text-muted-foreground">
                                Unravel employs a modular microservices-inspired architecture managed via Next.js serverless functions.
                            </p>
                            <div className="bg-card border border-border rounded-xl p-2 overflow-hidden shadow-2xl">
                                <img
                                    src="/unravel-architecture.png"
                                    alt="Unravel System Architecture Diagram"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                        </div>
                    </section>

                    {/* RAG Flow */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <GitBranch className="w-5 h-5 text-green-500" />
                            </div>
                            The RAG Flow
                        </h2>
                        <div className="relative border-l border-border ml-4 space-y-8 pb-4">
                            <TimelineItem
                                number={1}
                                title="Ingestion Phase"
                                content="Documents are uploaded to Supabase Storage. LlamaCloud parses complex formats (like multi-column PDFs) into plain text. The text is split into overlapping chunks to preserve context."
                            />
                            <TimelineItem
                                number={2}
                                title="Embedding Phase"
                                content="Each chunk is converted into a high-dimensional vector using the BAAI/bge-small-en-v1.5 model and stored in a vector index."
                            />
                            <TimelineItem
                                number={3}
                                title="Retrieval Phase"
                                content="When a user asks a question, their query is also embedded. We perform a cosine similarity search to find the top 5 most relevant document chunks."
                            />
                            <TimelineItem
                                number={4}
                                title="Generation Phase"
                                content="The relevant chunks are injected into the LLM's system prompt ('here is the context...'). The LLM generates an answer based ONLY on that context."
                            />
                        </div>
                    </section>

                    {/* Prompting Strategy */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                                <Lightbulb className="w-5 h-5 text-yellow-500" />
                            </div>
                            Prompting Strategy
                        </h2>
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                Unravel uses a "Strict Context" strategy to minimize hallucinations.
                            </p>
                            <div className="bg-muted rounded-xl p-6 border border-border font-mono text-sm">
                                <p className="text-blue-400 mb-2">// System Prompt</p>
                                <p>You are a helpful AI assistant.</p>
                                <p className="mt-2 text-green-400">RULES:</p>
                                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                    <li>Answer ONLY using the provided context.</li>
                                    <li>If the answer is not in the context, say "I unravel if you upload a document"</li>
                                    <li>Cite the document name for every claim.</li>
                                    <li>Do not use outside knowledge.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Tech Stack */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <Database className="w-5 h-5 text-cyan-500" />
                            </div>
                            Tech Stack
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <TechStackItem category="Frontend" items={["Next.js 16", "React 19", "Tailwind CSS 4", "Lucide Icons"]} />
                            <TechStackItem category="Backend" items={["Supabase (Postgres)", "Vercel Serverless", "Supabase Auth", "Edge Runtime"]} />
                            <TechStackItem category="AI / ML" items={["LlamaCloud", "OpenRouter API", "Gemini 2.0 Flash", "HuggingFace Embeddings"]} />
                        </div>
                    </section>

                    {/* Tradeoffs & Design Decisions */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                <GitBranch className="w-5 h-5 text-pink-500" />
                            </div>
                            Tradeoffs & Design Decisions
                        </h2>
                        <div className="space-y-6">
                            <DesignDecision
                                title="LlamaCloud vs. Local Parsing"
                                decision="Chose LlamaCloud"
                                reasoning="PDF parsing is notoriously difficult. Using a dedicated service ensures better text extraction from complex layouts (tables, columns) than local libraries like PDF.js, improving retrieval quality significantly."
                            />
                            <DesignDecision
                                title="OpenRouter vs. Direct OpenAI"
                                decision="Chose OpenRouter"
                                reasoning="Provides unified access to multiple models (Claude, Gemini, GPT). This allows us to switch models easily for cost optimization without code changes."
                            />
                            <DesignDecision
                                title="Streaming vs. Blocking"
                                decision="Chose Streaming"
                                reasoning="RAG pipelines can take 3-5 seconds. Streaming the response token-by-token reduces perceived latency and improves user engagement."
                            />
                        </div>
                    </section>

                    {/* Limitations & Future Improvements */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <ArrowRight className="w-5 h-5 text-indigo-500" />
                            </div>
                            Limitations & Future Improvements
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="font-semibold mb-3 text-red-400">Current Limitations</h3>
                                <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                                    <li>No history awareness in RAG (each query is independent)</li>
                                    <li>Processing large files (&gt;50MB) can be slow</li>
                                    <li>Images within documents are ignored (text-only)</li>
                                </ul>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="font-semibold mb-3 text-green-400">Future Roadmap</h3>
                                <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                                    <li><strong>Chat History Memory:</strong> Summarize previous turns to handle follow-up questions.</li>
                                    <li><strong>Multi-Modal RAG:</strong> Use Vision models to understand charts and images in PDFs.</li>
                                    <li><strong>HyDE (Hypothetical Document Embeddings):</strong> Improve retrieval by generating hypothetical answers first.</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="border-t border-border mt-20 pt-8 text-center text-muted-foreground">
                    <p>Built with ❤️ by Xander</p>
                    <div className="mt-4 flex justify-center gap-4">
                        <Link href="/" className="text-primary hover:underline">Home</Link>
                        <Link href="https://github.com/XJLabide/Unravel" className="text-primary hover:underline" target="_blank">GitHub</Link>
                    </div>
                </footer>
            </main>
        </div>
    );
}

// --- Helper Components ---

function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}

function TimelineItem({ number, title, content }: { number: number; title: string; content: string }) {
    return (
        <div className="relative pl-8">
            <div className="absolute -left-3 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold border-4 border-background">
                {number}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{content}</p>
        </div>
    );
}

function TechStackItem({ category, items }: { category: string; items: string[] }) {
    return (
        <div className="bg-muted/30 border border-border rounded-xl p-6">
            <h3 className="font-semibold text-primary mb-4 uppercase text-xs tracking-wider">{category}</h3>
            <ul className="space-y-2">
                {items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                        <div className="w-1 h-1 bg-foreground rounded-full" />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function DesignDecision({ title, decision, reasoning }: { title: string; decision: string; reasoning: string }) {
    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 border border-border rounded-xl bg-card">
            <div className="md:w-1/3">
                <h3 className="font-bold text-lg mb-1">{title}</h3>
                <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">
                    Decision: {decision}
                </span>
            </div>
            <div className="md:w-2/3">
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {reasoning}
                </p>
            </div>
        </div>
    );
}
