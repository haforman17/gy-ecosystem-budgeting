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
import AdminActivity from './pages/AdminActivity';
import AdminDashboard from './pages/AdminDashboard';
import AdminMessages from './pages/AdminMessages';
import AdminOrganizationDetail from './pages/AdminOrganizationDetail';
import AdminOrganizations from './pages/AdminOrganizations';
import AdminProjectData from './pages/AdminProjectData';
import AdminSettings from './pages/AdminSettings';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminUsers from './pages/AdminUsers';
import AuditLog from './pages/AuditLog';
import Compliance from './pages/Compliance';
import Dashboard from './pages/Dashboard';
import Features from './pages/Features';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import ProjectEdit from './pages/ProjectEdit';
import ProjectFinancials from './pages/ProjectFinancials';
import ProjectForecast from './pages/ProjectForecast';
import ProjectForecasting from './pages/ProjectForecasting';
import ProjectMonthlyForecast from './pages/ProjectMonthlyForecast';
import ProjectNew from './pages/ProjectNew';
import ProjectQuarterlyForecast from './pages/ProjectQuarterlyForecast';
import Projects from './pages/Projects';
import ReportBuilder from './pages/ReportBuilder';
import ReportGenerate from './pages/ReportGenerate';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminActivity": AdminActivity,
    "AdminDashboard": AdminDashboard,
    "AdminMessages": AdminMessages,
    "AdminOrganizationDetail": AdminOrganizationDetail,
    "AdminOrganizations": AdminOrganizations,
    "AdminProjectData": AdminProjectData,
    "AdminSettings": AdminSettings,
    "AdminUserDetail": AdminUserDetail,
    "AdminUsers": AdminUsers,
    "AuditLog": AuditLog,
    "Compliance": Compliance,
    "Dashboard": Dashboard,
    "Features": Features,
    "Home": Home,
    "ProjectDetail": ProjectDetail,
    "ProjectEdit": ProjectEdit,
    "ProjectFinancials": ProjectFinancials,
    "ProjectForecast": ProjectForecast,
    "ProjectForecasting": ProjectForecasting,
    "ProjectMonthlyForecast": ProjectMonthlyForecast,
    "ProjectNew": ProjectNew,
    "ProjectQuarterlyForecast": ProjectQuarterlyForecast,
    "Projects": Projects,
    "ReportBuilder": ReportBuilder,
    "ReportGenerate": ReportGenerate,
    "Reports": Reports,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};