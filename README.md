<div align="center">
  <h1>Nails by Rimal</h1>
  <p><strong>A specialized e-commerce platform for handcrafted press-on nails.</strong></p>
  <p>Built with Next.js 16, Supabase, and TypeScript.</p>
</div>

<hr />

<h2>Table of Contents</h2>
<ul>
  <li><a href="#about-the-project">About the Project</a></li>
  <li><a href="#core-features">Core Features</a></li>
  <li><a href="#tech-stack">Tech Stack</a></li>
  <li><a href="#database-structure">Database Structure</a></li>
  <li><a href="#business-logic--security">Business Logic &amp; Security</a></li>
  <li><a href="#project-structure">Project Structure</a></li>
  <li><a href="#getting-started">Getting Started</a></li>
  <li><a href="#ai-development-guidelines">AI Development Guidelines</a></li>
  <li><a href="#license">License</a></li>
</ul>

<hr />

<h2 id="about-the-project">About the Project</h2>
<p>Nails by Rimal is a custom e-commerce platform tailored for a handmade press-on nail business based in Pakistan. The application supports a highly customized shopping experience, allowing customers to easily build bespoke nail sets while supporting local payment preferences like Cash on Delivery (COD).</p>

<p><strong>Product Variations Supported:</strong></p>
<ul>
  <li><strong>Shapes:</strong> Almond, Coffin, Square, Stiletto</li>
  <li><strong>Lengths:</strong> Short, Medium, Long</li>
  <li><strong>Finishes:</strong> Custom colors and intricate designs</li>
</ul>

<hr />

<h2 id="core-features">Core Features</h2>
<ul>
  <li><strong>Product Catalog:</strong> A seamlessly browsable collection of press-on nails.</li>
  <li><strong>Variant System:</strong> Flexible combinations of shapes, lengths, and finishes for every product.</li>
  <li><strong>Guest Checkout:</strong> Streamlined ordering without the need for account creation.</li>
  <li><strong>Cash on Delivery:</strong> Localized payment options tailored for Pakistani customers.</li>
  <li><strong>Mobile Responsiveness:</strong> A highly optimized interface for mobile shopping.</li>
  <li><strong>Admin Dashboard:</strong> Centralized management for products, orders, and inventory.</li>
  <li><strong>Secure Authentication:</strong> Role-based access control for users and administrators.</li>
  <li><strong>Order Tracking:</strong> Transparent order status management for customers.</li>
</ul>

<hr />

<h2 id="tech-stack">Tech Stack</h2>
<p><strong>Frontend</strong></p>
<ul>
  <li>Next.js 16 (App Router)</li>
  <li>TypeScript</li>
  <li>Tailwind CSS &amp; CSS Variables</li>
  <li>Shadcn/UI &amp; Radix UI</li>
</ul>

<p><strong>Backend &amp; State Management</strong></p>
<ul>
  <li>Supabase (PostgreSQL, Authentication, Row Level Security)</li>
  <li>TanStack Query</li>
  <li>React Context API</li>
</ul>

<hr />

<h2 id="database-structure">Database Structure</h2>
<p>The database is engineered specifically for this e-commerce workflow:</p>
<ul>
  <li><strong>Products &amp; Variants:</strong> A flexible schema handling multi-dimensional combinations (shape &times; length &times; finish).</li>
  <li><strong>Orders &amp; Items:</strong> Dedicated structures for COD transactions and guest checkout support.</li>
  <li><strong>Categories:</strong> Organized naturally into Press-On Nails, Accessories, Gift Sets, and Seasonal items.</li>
  <li><strong>Cart System:</strong> Persistent storage for registered users, paired with localStorage integration for guests.</li>
  <li><strong>User Management:</strong> Segregated profiles supporting Admin, Customer, and Guest roles.</li>
</ul>

<hr />

<h2 id="business-logic--security">Business Logic &amp; Security</h2>

<h3>Security Protocols</h3>
<ul>
  <li><strong>Row Level Security (RLS):</strong> Enforced across all database tables.</li>
  <li><strong>Access Control:</strong> Strict role-based mapping (Admin vs. Customer vs. Guest).</li>
  <li><strong>Input Validation:</strong> Rigorous checks utilizing TypeScript and Zod schemas.</li>
  <li><strong>Data Integrity:</strong> Server-side price calculation to guarantee transaction accuracy (prices are never trusted from the client).</li>
</ul>

<h3>Operational Logic</h3>
<ul>
  <li><strong>Dynamic Inventory:</strong> Stock is tracked granularly per specific variant.</li>
  <li><strong>Dynamic Pricing:</strong> Variant price overrides are applied by the database during checkout.</li>
  <li><strong>SKU Generation:</strong> Standardized naming convention (<code>NBR-[PRODUCT]-[SHAPE]-[LENGTH]</code>).</li>
  <li><strong>Checkout Flow:</strong> Includes validated Pakistani address and phone fields for COD orders.</li>
</ul>

<hr />

<h2 id="project-structure">Project Structure</h2>
<pre><code>src/
├── app/                # Next.js 16 App Router
│   ├── (auth)/         # Authentication pages
│   ├── admin/          # Admin dashboard
│   ├── api/            # API endpoints
│   └── cart/           # Shopping cart
├── components/         # Reusable UI components
├── context/            # Global state management
├── hooks/              # Custom React hooks
├── services/           # Business logic &amp; API calls
└── types/              # TypeScript type definitions</code></pre>

<hr />

<h2 id="getting-started">Getting Started</h2>
<p>Follow these steps to set up the project locally.</p>

<h3>1. Clone the Repository</h3>
<pre><code>git clone https://github.com/TalhaDurrani/nails-by-rimal.git
cd nails-by-rimal
npm install</code></pre>

<h3>2. Environment Configuration</h3>
<p>Duplicate the example environment file and add the new Supabase publishable and secret keys. Never expose <code>SUPABASE_SECRET_KEY</code> with a <code>NEXT_PUBLIC_</code> prefix.</p>
<pre><code>cp .env.example .env.local</code></pre>

<h3>3. Database Initialization</h3>
<ul>
  <li>For the existing Nails by Rimal Supabase project, run only these files in order: <code>supabase/RESET_STORE_KEEP_ADMIN.sql</code>, <code>supabase/migrations/004_rebuild_schema_for_nails.sql</code>, <code>supabase/migrations/010_security_and_commerce_hardening.sql</code>, then <code>supabase/migrations/011_complete_bundles_and_packaging_checkout.sql</code>.</li>
  <li>The reset removes store data but preserves <code>auth.users</code> and <code>public.profiles</code>, including the existing administrator account.</li>
  <li><code>010_security_and_commerce_hardening.sql</code> adds atomic guest checkout, tracking IDs, inventory protection, admin-managed catalog tables, contact/newsletter storage, and secure storage policies.</li>
  <li><code>011_complete_bundles_and_packaging_checkout.sql</code> connects discounted bundles, box options, gift packing, and gift messages to trusted order totals and fulfillment records.</li>
  <li>Never put <code>SUPABASE_SECRET_KEY</code> in a variable prefixed with <code>NEXT_PUBLIC_</code>.</li>
</ul>

<p>Order email delivery is optional in development. Set <code>EMAIL_USER</code> and <code>EMAIL_PASS</code> (for Gmail, use an app password) to email the generated tracking ID. Orders still complete safely if the mail provider is temporarily unavailable.</p>

<h3>4. Launch the Application</h3>
<pre><code>npm run dev</code></pre>

<hr />

<h2 id="ai-development-guidelines">AI Development Guidelines</h2>
<p>Future developers and Codex sessions must read <a href="./AGENTS.md"><strong>AGENTS.md</strong></a> before making changes. It contains the current architecture, product decisions, database state, safety rules, and verification checklist.</p>

<hr />

<h2 id="license">License</h2>
<p>Private project. Proprietary to the Nails by Rimal business.</p>
