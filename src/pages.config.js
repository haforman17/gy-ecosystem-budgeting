/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AuditLog from './pages/AuditLog';
import Compliance from './pages/Compliance';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import ProjectEdit from './pages/ProjectEdit';
import ProjectFinancials from './pages/ProjectFinancials';
import ProjectForecast from './pages/ProjectForecast';
import ProjectNew from './pages/ProjectNew';
import Projects from './pages/Projects';
import ReportGenerate from './pages/ReportGenerate';
import Reports from './pages/Reports';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrganizations from './pages/AdminOrganizations';
import AdminOrganizationDetail from './pages/AdminOrganizationDetail';
import AdminUsers from './pages/AdminUsers';
import AdminActivity from './pages/AdminActivity';
import AdminMessages from './pages/AdminMessages';
import AdminSettings from './pages/AdminSettings';
import AdminUserDetail from './pages/AdminUserDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AuditLog": AuditLog,
    "Compliance": Compliance,
    "Dashboard": Dashboard,
    "Home": Home,
    "ProjectDetail": ProjectDetail,
    "ProjectEdit": ProjectEdit,
    "ProjectFinancials": ProjectFinancials,
    "ProjectForecast": ProjectForecast,
    "ProjectNew": ProjectNew,
    "Projects": Projects,
    "ReportGenerate": ReportGenerate,
    "Reports": Reports,
    "Features": Features,
    "Pricing": Pricing,
    "About": About,
    "Contact": Contact,
    "AdminDashboard": AdminDashboard,
    "AdminOrganizations": AdminOrganizations,
    "AdminOrganizationDetail": AdminOrganizationDetail,
    "AdminUsers": AdminUsers,
    "AdminActivity": AdminActivity,
    "AdminMessages": AdminMessages,
    "AdminSettings": AdminSettings,
    "AdminUserDetail": AdminUserDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};