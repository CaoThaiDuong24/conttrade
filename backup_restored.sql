--
-- PostgreSQL database dump
--

\restrict u3qqW8waSAvtKJBFyj29GikzmaiFZgRAbkRU0pkE1m2jJvgKcWm9hHa96IEtvwL

-- Dumped from database version 17.6 (Debian 17.6-2.pgdg13+1)
-- Dumped by pg_dump version 17.6 (Debian 17.6-2.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AuditAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AuditAction" AS ENUM (
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'EXPORT',
    'IMPORT'
);


ALTER TYPE public."AuditAction" OWNER TO postgres;

--
-- Name: CommissionRuleStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CommissionRuleStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED'
);


ALTER TYPE public."CommissionRuleStatus" OWNER TO postgres;

--
-- Name: ConfigEntryStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ConfigEntryStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."ConfigEntryStatus" OWNER TO postgres;

--
-- Name: ContainerCondition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ContainerCondition" AS ENUM (
    'CW',
    'WWT',
    'IICL'
);


ALTER TYPE public."ContainerCondition" OWNER TO postgres;

--
-- Name: ContainerStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ContainerStatus" AS ENUM (
    'AVAILABLE',
    'IN_USE',
    'MAINTENANCE',
    'SOLD',
    'SCRAPPED'
);


ALTER TYPE public."ContainerStatus" OWNER TO postgres;

--
-- Name: ContainerType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ContainerType" AS ENUM (
    'DRY',
    'HC',
    'RF',
    'OT',
    'TANK',
    'FLAT'
);


ALTER TYPE public."ContainerType" OWNER TO postgres;

--
-- Name: DealType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DealType" AS ENUM (
    'SALE',
    'RENTAL'
);


ALTER TYPE public."DealType" OWNER TO postgres;

--
-- Name: DeliveryEventType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DeliveryEventType" AS ENUM (
    'CREATED',
    'SCHEDULED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELAYED',
    'DELIVERED',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."DeliveryEventType" OWNER TO postgres;

--
-- Name: DeliveryMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DeliveryMethod" AS ENUM (
    'self_pickup',
    'logistics',
    'seller_delivers'
);


ALTER TYPE public."DeliveryMethod" OWNER TO postgres;

--
-- Name: DeliveryStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DeliveryStatus" AS ENUM (
    'PENDING',
    'SCHEDULED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."DeliveryStatus" OWNER TO postgres;

--
-- Name: DepotStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DepotStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'MAINTENANCE'
);


ALTER TYPE public."DepotStatus" OWNER TO postgres;

--
-- Name: DisputeStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DisputeStatus" AS ENUM (
    'OPEN',
    'INVESTIGATING',
    'RESOLVED',
    'CLOSED',
    'ESCALATED'
);


ALTER TYPE public."DisputeStatus" OWNER TO postgres;

--
-- Name: DocumentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DocumentStatus" AS ENUM (
    'DRAFT',
    'ISSUED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."DocumentStatus" OWNER TO postgres;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DocumentType" AS ENUM (
    'EDO',
    'EIR',
    'INVOICE',
    'RECEIPT',
    'CONTRACT',
    'OTHER'
);


ALTER TYPE public."DocumentType" OWNER TO postgres;

--
-- Name: FeatureFlagStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FeatureFlagStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED'
);


ALTER TYPE public."FeatureFlagStatus" OWNER TO postgres;

--
-- Name: FeeScheduleStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FeeScheduleStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED'
);


ALTER TYPE public."FeeScheduleStatus" OWNER TO postgres;

--
-- Name: FormSchemaStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FormSchemaStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED'
);


ALTER TYPE public."FormSchemaStatus" OWNER TO postgres;

--
-- Name: InspectionStandard; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InspectionStandard" AS ENUM (
    'CW',
    'WWT',
    'IICL'
);


ALTER TYPE public."InspectionStandard" OWNER TO postgres;

--
-- Name: InspectionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InspectionStatus" AS ENUM (
    'PENDING',
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."InspectionStatus" OWNER TO postgres;

--
-- Name: IntegrationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."IntegrationStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'MAINTENANCE',
    'DEPRECATED'
);


ALTER TYPE public."IntegrationStatus" OWNER TO postgres;

--
-- Name: ItemType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ItemType" AS ENUM (
    'CONTAINER',
    'INSPECTION',
    'REPAIR',
    'DELIVERY',
    'OTHER'
);


ALTER TYPE public."ItemType" OWNER TO postgres;

--
-- Name: KYBStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KYBStatus" AS ENUM (
    'UNVERIFIED',
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public."KYBStatus" OWNER TO postgres;

--
-- Name: KYCStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KYCStatus" AS ENUM (
    'UNVERIFIED',
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public."KYCStatus" OWNER TO postgres;

--
-- Name: ListingStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ListingStatus" AS ENUM (
    'DRAFT',
    'PENDING_REVIEW',
    'ACTIVE',
    'PAUSED',
    'SOLD',
    'RENTED',
    'ARCHIVED',
    'REJECTED'
);


ALTER TYPE public."ListingStatus" OWNER TO postgres;

--
-- Name: MediaType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MediaType" AS ENUM (
    'IMAGE',
    'VIDEO',
    'DOCUMENT'
);


ALTER TYPE public."MediaType" OWNER TO postgres;

--
-- Name: MovementDirection; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MovementDirection" AS ENUM (
    'INBOUND',
    'OUTBOUND'
);


ALTER TYPE public."MovementDirection" OWNER TO postgres;

--
-- Name: MovementType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MovementType" AS ENUM (
    'IN',
    'OUT',
    'TRANSFER',
    'ADJUSTMENT'
);


ALTER TYPE public."MovementType" OWNER TO postgres;

--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'EMAIL',
    'SMS',
    'IN_APP',
    'PUSH'
);


ALTER TYPE public."NotificationChannel" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'CREATED',
    'PENDING_PAYMENT',
    'PAYMENT_PENDING_VERIFICATION',
    'PAID',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED',
    'AWAITING_FUNDS',
    'ESCROW_FUNDED',
    'PREPARING_DELIVERY',
    'DOCUMENTS_READY',
    'TRANSPORTATION_BOOKED',
    'IN_TRANSIT',
    'PAYMENT_RELEASED',
    'DISPUTED',
    'READY_FOR_PICKUP',
    'DELIVERING'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: OverallRating; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OverallRating" AS ENUM (
    'EXCELLENT',
    'GOOD',
    'FAIR',
    'POOR'
);


ALTER TYPE public."OverallRating" OWNER TO postgres;

--
-- Name: PartnerStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PartnerStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."PartnerStatus" OWNER TO postgres;

--
-- Name: PartnerType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PartnerType" AS ENUM (
    'CARRIER',
    'INSPECTOR',
    'REPAIR_SHOP',
    'INSURANCE',
    'BANK',
    'OTHER'
);


ALTER TYPE public."PartnerType" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CARD',
    'BANK_TRANSFER',
    'EWALLET',
    'CASH'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentProvider; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentProvider" AS ENUM (
    'VNPAY',
    'MOMO',
    'BANK_TRANSFER',
    'CASH'
);


ALTER TYPE public."PaymentProvider" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REFUNDED',
    'ESCROW_HOLD',
    'RELEASED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: PermissionScope; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PermissionScope" AS ENUM (
    'GLOBAL',
    'OWN',
    'ORG',
    'DEPOT'
);


ALTER TYPE public."PermissionScope" OWNER TO postgres;

--
-- Name: PlanCycle; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PlanCycle" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'YEARLY'
);


ALTER TYPE public."PlanCycle" OWNER TO postgres;

--
-- Name: PolicyStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PolicyStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED'
);


ALTER TYPE public."PolicyStatus" OWNER TO postgres;

--
-- Name: QualityStandard; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QualityStandard" AS ENUM (
    'CW',
    'WWT',
    'IICL'
);


ALTER TYPE public."QualityStandard" OWNER TO postgres;

--
-- Name: QuoteStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QuoteStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED'
);


ALTER TYPE public."QuoteStatus" OWNER TO postgres;

--
-- Name: RFQPurpose; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RFQPurpose" AS ENUM (
    'PURCHASE',
    'RENTAL',
    'INQUIRY'
);


ALTER TYPE public."RFQPurpose" OWNER TO postgres;

--
-- Name: RFQStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RFQStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'QUOTED',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED'
);


ALTER TYPE public."RFQStatus" OWNER TO postgres;

--
-- Name: RefDocType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RefDocType" AS ENUM (
    'ORDER',
    'INSPECTION',
    'REPAIR',
    'TRANSFER',
    'ADJUSTMENT'
);


ALTER TYPE public."RefDocType" OWNER TO postgres;

--
-- Name: RepairStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RepairStatus" AS ENUM (
    'PENDING',
    'QUOTED',
    'APPROVED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."RepairStatus" OWNER TO postgres;

--
-- Name: RoleInDepot; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RoleInDepot" AS ENUM (
    'MANAGER',
    'STAFF',
    'INSPECTOR',
    'VIEWER'
);


ALTER TYPE public."RoleInDepot" OWNER TO postgres;

--
-- Name: RoleInOrg; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RoleInOrg" AS ENUM (
    'OWNER',
    'ADMIN',
    'MEMBER',
    'VIEWER'
);


ALTER TYPE public."RoleInOrg" OWNER TO postgres;

--
-- Name: Severity; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Severity" AS ENUM (
    'CRITICAL',
    'MAJOR',
    'MINOR',
    'COSMETIC'
);


ALTER TYPE public."Severity" OWNER TO postgres;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'CANCELLED',
    'EXPIRED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO postgres;

--
-- Name: TaxRateStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaxRateStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED'
);


ALTER TYPE public."TaxRateStatus" OWNER TO postgres;

--
-- Name: TemplateStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TemplateStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED'
);


ALTER TYPE public."TemplateStatus" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'PENDING_VERIFICATION'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

--
-- Name: UserType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserType" AS ENUM (
    'INDIVIDUAL',
    'COMPANY',
    'GOVERNMENT'
);


ALTER TYPE public."UserType" OWNER TO postgres;

--
-- Name: increment_role_version(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_role_version() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        -- Update version in roles table when role_permissions changes
        -- Use OLD.role_id for DELETE, NEW.role_id for INSERT/UPDATE
        IF TG_OP = 'DELETE' THEN
          UPDATE roles 
          SET updated_at = CURRENT_TIMESTAMP 
          WHERE id = OLD.role_id;
          RETURN OLD;
        ELSE
          UPDATE roles 
          SET updated_at = CURRENT_TIMESTAMP 
          WHERE id = NEW.role_id;
          RETURN NEW;
        END IF;
      END;
      $$;


ALTER FUNCTION public.increment_role_version() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    actor_id text,
    action public."AuditAction" NOT NULL,
    target_table text NOT NULL,
    target_id text,
    meta jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: business_hours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_hours (
    id text NOT NULL,
    org_id text,
    timezone text NOT NULL,
    schedule_json jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.business_hours OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: commission_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commission_rules (
    id text NOT NULL,
    rule_code text NOT NULL,
    name text NOT NULL,
    basis text NOT NULL,
    percent numeric(65,30) NOT NULL,
    min_amount numeric(65,30),
    max_amount numeric(65,30),
    conditions_json jsonb,
    effective_from timestamp(3) without time zone NOT NULL,
    effective_to timestamp(3) without time zone,
    status public."CommissionRuleStatus" DEFAULT 'ACTIVE'::public."CommissionRuleStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.commission_rules OWNER TO postgres;

--
-- Name: config_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.config_entries (
    id text NOT NULL,
    namespace_id text NOT NULL,
    key text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    status public."ConfigEntryStatus" DEFAULT 'DRAFT'::public."ConfigEntryStatus" NOT NULL,
    value_json jsonb NOT NULL,
    checksum text,
    created_by text,
    published_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.config_entries OWNER TO postgres;

--
-- Name: config_namespaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.config_namespaces (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.config_namespaces OWNER TO postgres;

--
-- Name: containers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.containers (
    id text NOT NULL,
    iso_code text NOT NULL,
    size_ft integer NOT NULL,
    type public."ContainerType" NOT NULL,
    serial_no text NOT NULL,
    owner_org_id text,
    current_depot_id text,
    condition public."ContainerCondition" NOT NULL,
    quality_standard public."QualityStandard" NOT NULL,
    csc_plate_no text,
    manufactured_year integer,
    last_inspection_date timestamp(3) without time zone,
    last_repair_date timestamp(3) without time zone,
    status public."ContainerStatus" DEFAULT 'AVAILABLE'::public."ContainerStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.containers OWNER TO postgres;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id text NOT NULL,
    listing_id text NOT NULL,
    buyer_id text NOT NULL,
    seller_id text NOT NULL,
    last_message_at timestamp(3) without time zone,
    buyer_unread integer DEFAULT 0 NOT NULL,
    seller_unread integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: deliveries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deliveries (
    id text NOT NULL,
    order_id text NOT NULL,
    pickup_depot_id text,
    dropoff_address text NOT NULL,
    dropoff_contact jsonb,
    schedule_at timestamp(3) without time zone,
    "carrierId" text,
    carrier_name text,
    tracking_number text,
    status public."DeliveryStatus" DEFAULT 'PENDING'::public."DeliveryStatus" NOT NULL,
    gps_tracking_id text,
    estimated_delivery timestamp(3) without time zone,
    actual_delivery timestamp(3) without time zone,
    delivery_notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    booked_at timestamp(3) without time zone,
    current_location text,
    delivered_at timestamp(3) without time zone,
    delivery_address text,
    delivery_contact text,
    delivery_date timestamp(3) without time zone,
    delivery_phone text,
    delivery_time text,
    eir_data jsonb,
    in_transit_at timestamp(3) without time zone,
    needs_crane boolean DEFAULT false NOT NULL,
    notes text,
    special_instructions text,
    transportation_fee numeric(65,30),
    carrier_contact_json jsonb,
    transport_method character varying(50),
    route_json jsonb,
    driver_info_json jsonb,
    delivery_location_json jsonb,
    delivery_proof_json jsonb,
    eir_data_json jsonb,
    received_by_name character varying(255),
    received_by_signature text,
    driver_notes text,
    delivery_method public."DeliveryMethod" DEFAULT 'logistics'::public."DeliveryMethod" NOT NULL,
    logistics_company text,
    receipt_confirmed_at timestamp(6) without time zone,
    receipt_data_json jsonb
);


ALTER TABLE public.deliveries OWNER TO postgres;

--
-- Name: COLUMN deliveries.carrier_contact_json; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.deliveries.carrier_contact_json IS 'Contact info: {name, phone, email, company}';


--
-- Name: COLUMN deliveries.route_json; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.deliveries.route_json IS 'Planned route: {waypoints: [{location, eta, status}]}';


--
-- Name: COLUMN deliveries.driver_info_json; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.deliveries.driver_info_json IS 'Driver details: {name, phone, license_no, vehicle_no}';


--
-- Name: COLUMN deliveries.delivery_location_json; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.deliveries.delivery_location_json IS 'Actual delivery location: {lat, lng, address, timestamp}';


--
-- Name: COLUMN deliveries.delivery_proof_json; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.deliveries.delivery_proof_json IS 'Proof of delivery: {photos: [], signature, timestamp}';


--
-- Name: COLUMN deliveries.eir_data_json; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.deliveries.eir_data_json IS 'Equipment Interchange Receipt: {container_condition, damages: [], photos: []}';


--
-- Name: COLUMN deliveries.delivery_method; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.deliveries.delivery_method IS 'Method of delivery (self_pickup, logistics, seller_delivers)';


--
-- Name: COLUMN deliveries.logistics_company; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.deliveries.logistics_company IS 'Name of logistics company if using third-party logistics';


--
-- Name: COLUMN deliveries.receipt_confirmed_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.deliveries.receipt_confirmed_at IS 'Timestamp when receipt was confirmed';


--
-- Name: COLUMN deliveries.receipt_data_json; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.deliveries.receipt_data_json IS 'Receipt confirmation data';


--
-- Name: delivery_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_events (
    id text NOT NULL,
    delivery_id text NOT NULL,
    event_type public."DeliveryEventType" NOT NULL,
    payload jsonb,
    location jsonb,
    occurred_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.delivery_events OWNER TO postgres;

--
-- Name: depot_calendars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.depot_calendars (
    id text NOT NULL,
    depot_id text NOT NULL,
    closed_dates_json jsonb,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.depot_calendars OWNER TO postgres;

--
-- Name: depot_stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.depot_stock_movements (
    id text NOT NULL,
    depot_id text NOT NULL,
    container_id text,
    owner_org_id text,
    movement_type public."MovementType" NOT NULL,
    direction public."MovementDirection" NOT NULL,
    ref_doc_type public."RefDocType" NOT NULL,
    ref_doc_id text,
    reason text,
    occurred_at timestamp(3) without time zone NOT NULL,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.depot_stock_movements OWNER TO postgres;

--
-- Name: depot_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.depot_users (
    id text NOT NULL,
    depot_id text NOT NULL,
    user_id text NOT NULL,
    role_in_depot public."RoleInDepot" NOT NULL,
    permissions jsonb,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.depot_users OWNER TO postgres;

--
-- Name: depots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.depots (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    address text,
    province text,
    city text,
    geo_point text,
    capacity_teu integer,
    contact jsonb,
    operating_hours jsonb,
    services jsonb,
    status public."DepotStatus" DEFAULT 'ACTIVE'::public."DepotStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.depots OWNER TO postgres;

--
-- Name: dispute_audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispute_audit_logs (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    dispute_id text NOT NULL,
    user_id text NOT NULL,
    action character varying(50) NOT NULL,
    old_value text,
    new_value text,
    metadata_json jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dispute_audit_logs OWNER TO postgres;

--
-- Name: dispute_evidence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispute_evidence (
    id text NOT NULL,
    dispute_id text NOT NULL,
    uploader_id text NOT NULL,
    file_url text NOT NULL,
    file_type text,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.dispute_evidence OWNER TO postgres;

--
-- Name: dispute_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispute_messages (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    dispute_id text NOT NULL,
    sender_id text NOT NULL,
    message text NOT NULL,
    attachments_json jsonb,
    is_internal boolean DEFAULT false,
    is_resolution boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    read_at timestamp with time zone
);


ALTER TABLE public.dispute_messages OWNER TO postgres;

--
-- Name: disputes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disputes (
    id text NOT NULL,
    order_id text NOT NULL,
    raised_by text NOT NULL,
    status public."DisputeStatus" DEFAULT 'OPEN'::public."DisputeStatus" NOT NULL,
    reason text NOT NULL,
    description text,
    resolution text,
    resolved_by text,
    resolved_at timestamp(3) without time zone,
    closed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    assigned_to text,
    evidence_json jsonb,
    requested_resolution character varying(100),
    requested_amount numeric(15,2),
    admin_notes text,
    resolution_notes text,
    resolution_amount numeric(15,2),
    priority character varying(20) DEFAULT 'MEDIUM'::character varying,
    responded_at timestamp with time zone,
    escalated_at timestamp with time zone
);


ALTER TABLE public.disputes OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id text NOT NULL,
    order_id text,
    doc_type public."DocumentType" NOT NULL,
    number text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    mime_type text,
    issued_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    issued_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    document_number text,
    metadata jsonb,
    pickup_code text,
    status public."DocumentStatus" DEFAULT 'DRAFT'::public."DocumentStatus" NOT NULL,
    valid_until timestamp(3) without time zone
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    id text NOT NULL,
    user_id text NOT NULL,
    listing_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- Name: feature_flags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feature_flags (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    enabled boolean DEFAULT false NOT NULL,
    rollout_json jsonb,
    effective_from timestamp(3) without time zone,
    effective_to timestamp(3) without time zone,
    version integer DEFAULT 1 NOT NULL,
    status public."FeatureFlagStatus" DEFAULT 'DRAFT'::public."FeatureFlagStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.feature_flags OWNER TO postgres;

--
-- Name: fee_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_schedules (
    id text NOT NULL,
    fee_code text NOT NULL,
    name text NOT NULL,
    calc_type text NOT NULL,
    currency text NOT NULL,
    amount numeric(65,30),
    percent numeric(65,30),
    tiers_json jsonb,
    scope text NOT NULL,
    effective_from timestamp(3) without time zone NOT NULL,
    effective_to timestamp(3) without time zone,
    status public."FeeScheduleStatus" DEFAULT 'ACTIVE'::public."FeeScheduleStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.fee_schedules OWNER TO postgres;

--
-- Name: form_schemas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_schemas (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    scope text NOT NULL,
    json_schema jsonb NOT NULL,
    ui_schema jsonb,
    version integer DEFAULT 1 NOT NULL,
    status public."FormSchemaStatus" DEFAULT 'DRAFT'::public."FormSchemaStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.form_schemas OWNER TO postgres;

--
-- Name: i18n_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.i18n_translations (
    id text NOT NULL,
    namespace text NOT NULL,
    key text NOT NULL,
    locale text NOT NULL,
    value text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.i18n_translations OWNER TO postgres;

--
-- Name: inspection_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspection_items (
    id text NOT NULL,
    inspection_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    severity public."Severity" NOT NULL,
    note text,
    photo_url text,
    rating integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inspection_items OWNER TO postgres;

--
-- Name: inspections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspections (
    id text NOT NULL,
    listing_id text,
    depot_id text NOT NULL,
    requested_by text NOT NULL,
    inspector_id text,
    status public."InspectionStatus" DEFAULT 'PENDING'::public."InspectionStatus" NOT NULL,
    standard public."InspectionStandard" NOT NULL,
    scheduled_at timestamp(3) without time zone,
    started_at timestamp(3) without time zone,
    completed_at timestamp(3) without time zone,
    summary text,
    overall_rating public."OverallRating",
    recommendations text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.inspections OWNER TO postgres;

--
-- Name: integration_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integration_configs (
    id text NOT NULL,
    vendor_code text NOT NULL,
    name text NOT NULL,
    config_json jsonb NOT NULL,
    secrets_ref text,
    version integer DEFAULT 1 NOT NULL,
    status public."IntegrationStatus" DEFAULT 'ACTIVE'::public."IntegrationStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.integration_configs OWNER TO postgres;

--
-- Name: listing_facets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listing_facets (
    id text NOT NULL,
    listing_id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.listing_facets OWNER TO postgres;

--
-- Name: listing_media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listing_media (
    id text NOT NULL,
    listing_id text NOT NULL,
    media_url text NOT NULL,
    media_type public."MediaType" NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    alt_text text,
    file_size integer,
    mime_type text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    original_filename text,
    uploaded_by text
);


ALTER TABLE public.listing_media OWNER TO postgres;

--
-- Name: listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listings (
    id text NOT NULL,
    container_id text,
    seller_user_id text NOT NULL,
    org_id text,
    deal_type public."DealType" NOT NULL,
    price_currency text DEFAULT 'VND'::text NOT NULL,
    price_amount numeric(65,30) NOT NULL,
    rental_unit text,
    location_depot_id text,
    status public."ListingStatus" DEFAULT 'DRAFT'::public."ListingStatus" NOT NULL,
    title text NOT NULL,
    description text,
    features jsonb,
    specifications jsonb,
    view_count integer DEFAULT 0 NOT NULL,
    favorite_count integer DEFAULT 0 NOT NULL,
    published_at timestamp(3) without time zone,
    expires_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    rejection_reason text,
    admin_reviewed_by character varying(255),
    admin_reviewed_at timestamp without time zone,
    total_quantity integer DEFAULT 1,
    available_quantity integer DEFAULT 1,
    rented_quantity integer DEFAULT 0,
    reserved_quantity integer DEFAULT 0,
    maintenance_quantity integer DEFAULT 0,
    min_rental_duration integer,
    max_rental_duration integer,
    deposit_required boolean DEFAULT false,
    deposit_amount numeric(15,2),
    deposit_currency character varying(3),
    late_return_fee_amount numeric(15,2),
    late_return_fee_unit character varying(20),
    earliest_available_date timestamp without time zone,
    latest_return_date timestamp without time zone,
    auto_renewal_enabled boolean DEFAULT false,
    renewal_notice_days integer DEFAULT 7,
    renewal_price_adjustment numeric(5,2) DEFAULT 0.00,
    last_rented_at timestamp without time zone,
    total_rental_count integer DEFAULT 0,
    CONSTRAINT check_available_quantity_non_negative CHECK ((available_quantity >= 0)),
    CONSTRAINT check_deposit_amount_positive CHECK (((deposit_amount IS NULL) OR (deposit_amount > (0)::numeric))),
    CONSTRAINT check_deposit_currency_when_required CHECK (((NOT deposit_required) OR ((deposit_amount IS NOT NULL) AND (deposit_amount > (0)::numeric) AND (deposit_currency IS NOT NULL)))),
    CONSTRAINT check_late_fee_amount_positive CHECK (((late_return_fee_amount IS NULL) OR (late_return_fee_amount > (0)::numeric))),
    CONSTRAINT check_maintenance_quantity_non_negative CHECK ((maintenance_quantity >= 0)),
    CONSTRAINT check_quantity_balance CHECK (((((available_quantity + rented_quantity) + reserved_quantity) + maintenance_quantity) = total_quantity)),
    CONSTRAINT check_renewal_notice_days_positive CHECK ((renewal_notice_days > 0)),
    CONSTRAINT check_rental_duration_logical CHECK ((((min_rental_duration IS NULL) OR (min_rental_duration > 0)) AND ((max_rental_duration IS NULL) OR (max_rental_duration > 0)) AND ((min_rental_duration IS NULL) OR (max_rental_duration IS NULL) OR (min_rental_duration <= max_rental_duration)))),
    CONSTRAINT check_rented_quantity_non_negative CHECK ((rented_quantity >= 0)),
    CONSTRAINT check_reserved_quantity_non_negative CHECK ((reserved_quantity >= 0)),
    CONSTRAINT check_return_date_after_available CHECK (((earliest_available_date IS NULL) OR (latest_return_date IS NULL) OR (earliest_available_date < latest_return_date))),
    CONSTRAINT check_total_quantity_positive CHECK ((total_quantity >= 1)),
    CONSTRAINT check_total_rental_count_non_negative CHECK ((total_rental_count >= 0))
);


ALTER TABLE public.listings OWNER TO postgres;

--
-- Name: COLUMN listings.total_quantity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.total_quantity IS 'T???ng s??? container c?? th??? cho thu??';


--
-- Name: COLUMN listings.available_quantity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.available_quantity IS 'S??? l?????ng container hi???n c?? s???n';


--
-- Name: COLUMN listings.rented_quantity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.rented_quantity IS 'S??? l?????ng container ??ang ???????c thu??';


--
-- Name: COLUMN listings.reserved_quantity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.reserved_quantity IS 'S??? l?????ng container ???? ???????c ?????t tr?????c';


--
-- Name: COLUMN listings.maintenance_quantity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.maintenance_quantity IS 'S??? l?????ng container ??ang b???o tr??';


--
-- Name: COLUMN listings.min_rental_duration; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.min_rental_duration IS 'Th???i gian thu?? t???i thi???u (s??? ????n v??? theo rental_unit)';


--
-- Name: COLUMN listings.max_rental_duration; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.max_rental_duration IS 'Th???i gian thu?? t???i ??a (s??? ????n v??? theo rental_unit)';


--
-- Name: COLUMN listings.deposit_required; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.deposit_required IS 'C?? y??u c???u ?????t c???c hay kh??ng';


--
-- Name: COLUMN listings.deposit_amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.deposit_amount IS 'S??? ti???n ?????t c???c';


--
-- Name: COLUMN listings.deposit_currency; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.deposit_currency IS 'Lo???i ti???n t??? ?????t c???c (VND, USD, etc)';


--
-- Name: COLUMN listings.late_return_fee_amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.late_return_fee_amount IS 'Ph?? ph???t khi tr??? mu???n';


--
-- Name: COLUMN listings.late_return_fee_unit; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.late_return_fee_unit IS '????n v??? t??nh ph??: PER_DAY, PER_WEEK, PERCENTAGE';


--
-- Name: COLUMN listings.earliest_available_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.earliest_available_date IS 'Ng??y s???m nh???t c?? th??? giao container';


--
-- Name: COLUMN listings.latest_return_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.latest_return_date IS 'Ng??y mu???n nh???t ph???i tr??? container';


--
-- Name: COLUMN listings.auto_renewal_enabled; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.auto_renewal_enabled IS 'Cho ph??p gia h???n h???p ?????ng t??? ?????ng';


--
-- Name: COLUMN listings.renewal_notice_days; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.renewal_notice_days IS 'S??? ng??y th??ng b??o tr?????c khi h???t h???n';


--
-- Name: COLUMN listings.renewal_price_adjustment; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.renewal_price_adjustment IS 'Ph???n tr??m ??i???u ch???nh gi?? khi gia h???n';


--
-- Name: COLUMN listings.last_rented_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.last_rented_at IS 'Th???i ??i???m thu?? g???n nh???t';


--
-- Name: COLUMN listings.total_rental_count; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.listings.total_rental_count IS 'T???ng s??? l???n container ???????c thu??';


--
-- Name: CONSTRAINT check_quantity_balance ON listings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT check_quantity_balance ON public.listings IS '?????m b???o t???ng s??? container ???????c ph??n b??? ????ng: available + rented + reserved + maintenance = total';


--
-- Name: marketplace_policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketplace_policies (
    id text NOT NULL,
    policy_code text NOT NULL,
    name text NOT NULL,
    content_md text NOT NULL,
    effective_from timestamp(3) without time zone NOT NULL,
    effective_to timestamp(3) without time zone,
    version integer DEFAULT 1 NOT NULL,
    status public."PolicyStatus" DEFAULT 'DRAFT'::public."PolicyStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.marketplace_policies OWNER TO postgres;

--
-- Name: md_adjust_reasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_adjust_reasons (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_adjust_reasons OWNER TO postgres;

--
-- Name: md_business_hours_policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_business_hours_policies (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_business_hours_policies OWNER TO postgres;

--
-- Name: md_cancel_reasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_cancel_reasons (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_cancel_reasons OWNER TO postgres;

--
-- Name: md_cities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_cities (
    id text NOT NULL,
    province_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    name_en text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_cities OWNER TO postgres;

--
-- Name: md_commission_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_commission_codes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_commission_codes OWNER TO postgres;

--
-- Name: md_container_sizes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_container_sizes (
    id text NOT NULL,
    size_ft integer NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_container_sizes OWNER TO postgres;

--
-- Name: md_container_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_container_types (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_container_types OWNER TO postgres;

--
-- Name: md_countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_countries (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    name_en text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_countries OWNER TO postgres;

--
-- Name: md_currencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_currencies (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    symbol text NOT NULL,
    decimal_places integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_currencies OWNER TO postgres;

--
-- Name: md_deal_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_deal_types (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_deal_types OWNER TO postgres;

--
-- Name: md_delivery_event_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_delivery_event_types (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_delivery_event_types OWNER TO postgres;

--
-- Name: md_delivery_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_delivery_statuses (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_delivery_statuses OWNER TO postgres;

--
-- Name: md_dispute_reasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_dispute_reasons (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_dispute_reasons OWNER TO postgres;

--
-- Name: md_dispute_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_dispute_statuses (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_dispute_statuses OWNER TO postgres;

--
-- Name: md_document_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_document_types (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_document_types OWNER TO postgres;

--
-- Name: md_feature_flag_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_feature_flag_codes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_feature_flag_codes OWNER TO postgres;

--
-- Name: md_fee_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_fee_codes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_fee_codes OWNER TO postgres;

--
-- Name: md_form_schema_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_form_schema_codes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_form_schema_codes OWNER TO postgres;

--
-- Name: md_i18n_namespaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_i18n_namespaces (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_i18n_namespaces OWNER TO postgres;

--
-- Name: md_incoterms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_incoterms (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_incoterms OWNER TO postgres;

--
-- Name: md_inspection_item_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_inspection_item_codes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_inspection_item_codes OWNER TO postgres;

--
-- Name: md_insurance_coverages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_insurance_coverages (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_insurance_coverages OWNER TO postgres;

--
-- Name: md_integration_vendor_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_integration_vendor_codes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_integration_vendor_codes OWNER TO postgres;

--
-- Name: md_iso_container_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_iso_container_codes (
    id text NOT NULL,
    iso_code text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_iso_container_codes OWNER TO postgres;

--
-- Name: md_listing_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_listing_statuses (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_listing_statuses OWNER TO postgres;

--
-- Name: md_movement_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_movement_types (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_movement_types OWNER TO postgres;

--
-- Name: md_notification_channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_notification_channels (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_notification_channels OWNER TO postgres;

--
-- Name: md_notification_event_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_notification_event_types (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_notification_event_types OWNER TO postgres;

--
-- Name: md_order_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_order_statuses (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_order_statuses OWNER TO postgres;

--
-- Name: md_partner_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_partner_types (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_partner_types OWNER TO postgres;

--
-- Name: md_payment_failure_reasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_payment_failure_reasons (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_payment_failure_reasons OWNER TO postgres;

--
-- Name: md_payment_method_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_payment_method_types (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_payment_method_types OWNER TO postgres;

--
-- Name: md_payment_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_payment_statuses (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_payment_statuses OWNER TO postgres;

--
-- Name: md_pricing_regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_pricing_regions (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_pricing_regions OWNER TO postgres;

--
-- Name: md_provinces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_provinces (
    id text NOT NULL,
    country_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    name_en text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_provinces OWNER TO postgres;

--
-- Name: md_quality_standards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_quality_standards (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_quality_standards OWNER TO postgres;

--
-- Name: md_rating_scales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_rating_scales (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_rating_scales OWNER TO postgres;

--
-- Name: md_redaction_channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_redaction_channels (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_redaction_channels OWNER TO postgres;

--
-- Name: md_ref_doc_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_ref_doc_types (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_ref_doc_types OWNER TO postgres;

--
-- Name: md_rental_units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_rental_units (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_rental_units OWNER TO postgres;

--
-- Name: md_repair_item_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_repair_item_codes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_repair_item_codes OWNER TO postgres;

--
-- Name: md_service_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_service_codes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_service_codes OWNER TO postgres;

--
-- Name: md_sla_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_sla_codes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_sla_codes OWNER TO postgres;

--
-- Name: md_tax_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_tax_codes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_tax_codes OWNER TO postgres;

--
-- Name: md_template_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_template_codes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_template_codes OWNER TO postgres;

--
-- Name: md_units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_units (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_units OWNER TO postgres;

--
-- Name: md_unlocodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_unlocodes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    country_code text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_unlocodes OWNER TO postgres;

--
-- Name: md_violation_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.md_violation_codes (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.md_violation_codes OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id text NOT NULL,
    conversation_id text NOT NULL,
    sender_id text NOT NULL,
    content text NOT NULL,
    attachments jsonb,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_templates (
    id text NOT NULL,
    channel public."NotificationChannel" NOT NULL,
    template_code text NOT NULL,
    locale text NOT NULL,
    subject text,
    body_md text NOT NULL,
    variables_json jsonb,
    version integer DEFAULT 1 NOT NULL,
    status public."TemplateStatus" DEFAULT 'DRAFT'::public."TemplateStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_templates OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    data jsonb,
    read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    order_id text NOT NULL,
    item_type public."ItemType" NOT NULL,
    ref_id text,
    description text NOT NULL,
    qty numeric(65,30) NOT NULL,
    unit_price numeric(65,30) NOT NULL,
    total_price numeric(65,30) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_preparations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_preparations (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    order_id text NOT NULL,
    seller_id text NOT NULL,
    preparation_started_at timestamp with time zone DEFAULT now() NOT NULL,
    preparation_completed_at timestamp with time zone,
    estimated_ready_date timestamp with time zone,
    container_inspection_completed boolean DEFAULT false,
    container_cleaned boolean DEFAULT false,
    container_repaired boolean DEFAULT false,
    documents_prepared boolean DEFAULT false,
    customs_cleared boolean DEFAULT false,
    inspection_photos_json jsonb,
    repair_photos_json jsonb,
    document_urls_json jsonb,
    preparation_notes text,
    seller_notes text,
    pickup_location_json jsonb,
    pickup_contact_name character varying(255),
    pickup_contact_phone character varying(50),
    pickup_instructions text,
    pickup_available_from timestamp with time zone,
    pickup_available_to timestamp with time zone,
    status character varying(50) DEFAULT 'PREPARING'::character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.order_preparations OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    buyer_id text NOT NULL,
    seller_id text NOT NULL,
    listing_id text,
    quote_id text,
    org_ids jsonb,
    status public."OrderStatus" DEFAULT 'CREATED'::public."OrderStatus" NOT NULL,
    subtotal numeric(65,30) NOT NULL,
    tax numeric(65,30) DEFAULT 0 NOT NULL,
    fees numeric(65,30) DEFAULT 0 NOT NULL,
    total numeric(65,30) NOT NULL,
    currency text DEFAULT 'VND'::text NOT NULL,
    order_number text NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    ready_date timestamp without time zone,
    delivered_at timestamp without time zone,
    completed_at timestamp without time zone,
    payment_verified_at timestamp(3) without time zone,
    receipt_confirmed_at timestamp(6) without time zone,
    receipt_confirmed_by text,
    receipt_data_json jsonb
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: COLUMN orders.receipt_confirmed_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.orders.receipt_confirmed_at IS 'Timestamp when buyer confirmed receipt';


--
-- Name: COLUMN orders.receipt_confirmed_by; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.orders.receipt_confirmed_by IS 'User ID of buyer who confirmed';


--
-- Name: COLUMN orders.receipt_data_json; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.orders.receipt_data_json IS 'Receipt data: received_by, condition, photos, notes, signature';


--
-- Name: org_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org_users (
    id text NOT NULL,
    org_id text NOT NULL,
    user_id text NOT NULL,
    role_in_org public."RoleInOrg" NOT NULL,
    permissions jsonb,
    joined_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.org_users OWNER TO postgres;

--
-- Name: orgs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orgs (
    id text NOT NULL,
    name text NOT NULL,
    tax_code text,
    kyb_status public."KYBStatus" DEFAULT 'UNVERIFIED'::public."KYBStatus" NOT NULL,
    owner_user_id text NOT NULL,
    business_type text,
    registration_number text,
    address text,
    province text,
    contact_person text,
    contact_phone text,
    contact_email text,
    website text,
    description text,
    logo_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.orgs OWNER TO postgres;

--
-- Name: partners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partners (
    id text NOT NULL,
    type public."PartnerType" NOT NULL,
    name text NOT NULL,
    contact_json jsonb NOT NULL,
    status public."PartnerStatus" DEFAULT 'ACTIVE'::public."PartnerStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.partners OWNER TO postgres;

--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_methods (
    id text NOT NULL,
    code text NOT NULL,
    provider text NOT NULL,
    method_type text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    config_json jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payment_methods OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    order_id text NOT NULL,
    provider public."PaymentProvider" NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    escrow_account_ref text,
    amount numeric(65,30) NOT NULL,
    currency text DEFAULT 'VND'::text NOT NULL,
    transaction_id text,
    gateway_response jsonb,
    paid_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    escrow_hold_until timestamp(3) without time zone,
    released_at timestamp(3) without time zone,
    verified_at timestamp(3) without time zone,
    verified_by text,
    notes text
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plans (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(65,30) NOT NULL,
    currency text DEFAULT 'VND'::text NOT NULL,
    cycle public."PlanCycle" NOT NULL,
    features jsonb,
    max_listings integer,
    max_rfqs integer,
    priority_support boolean DEFAULT false NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.plans OWNER TO postgres;

--
-- Name: qa_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qa_answers (
    id text NOT NULL,
    question_id text NOT NULL,
    responder_id text NOT NULL,
    answer text NOT NULL,
    moderated boolean DEFAULT false NOT NULL,
    moderated_by text,
    moderated_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.qa_answers OWNER TO postgres;

--
-- Name: qa_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qa_questions (
    id text NOT NULL,
    rfq_id text NOT NULL,
    author_id text NOT NULL,
    question text NOT NULL,
    moderated boolean DEFAULT false NOT NULL,
    moderated_by text,
    moderated_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.qa_questions OWNER TO postgres;

--
-- Name: quote_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quote_items (
    id text NOT NULL,
    quote_id text NOT NULL,
    item_type public."ItemType" NOT NULL,
    ref_id text,
    description text NOT NULL,
    qty numeric(65,30) NOT NULL,
    unit_price numeric(65,30) NOT NULL,
    total_price numeric(65,30) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.quote_items OWNER TO postgres;

--
-- Name: quotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotes (
    id text NOT NULL,
    rfq_id text NOT NULL,
    seller_id text NOT NULL,
    price_subtotal numeric(65,30) NOT NULL,
    fees_json jsonb,
    total numeric(65,30) NOT NULL,
    currency text DEFAULT 'VND'::text NOT NULL,
    valid_until timestamp(3) without time zone,
    status public."QuoteStatus" DEFAULT 'DRAFT'::public."QuoteStatus" NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.quotes OWNER TO postgres;

--
-- Name: redaction_patterns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.redaction_patterns (
    id text NOT NULL,
    code text NOT NULL,
    pattern text NOT NULL,
    description text,
    channel text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    severity text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.redaction_patterns OWNER TO postgres;

--
-- Name: repair_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repair_items (
    id text NOT NULL,
    repair_id text NOT NULL,
    item_code text NOT NULL,
    description text NOT NULL,
    qty numeric(65,30) NOT NULL,
    unit_price numeric(65,30) NOT NULL,
    total_price numeric(65,30) NOT NULL,
    note text,
    before_photo text,
    after_photo text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.repair_items OWNER TO postgres;

--
-- Name: repairs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repairs (
    id text NOT NULL,
    inspection_id text,
    depot_id text NOT NULL,
    quote_amount numeric(65,30),
    actual_amount numeric(65,30),
    status public."RepairStatus" DEFAULT 'PENDING'::public."RepairStatus" NOT NULL,
    description text,
    started_at timestamp(3) without time zone,
    completed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.repairs OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    order_id text NOT NULL,
    reviewer_id text NOT NULL,
    reviewee_id text NOT NULL,
    rating integer NOT NULL,
    comment text,
    response text,
    response_by text,
    response_at timestamp(3) without time zone,
    moderated boolean DEFAULT false NOT NULL,
    moderated_by text,
    moderated_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: rfqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rfqs (
    id text NOT NULL,
    listing_id text,
    buyer_id text NOT NULL,
    purpose public."RFQPurpose" NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    need_by timestamp(3) without time zone,
    services_json jsonb,
    status public."RFQStatus" DEFAULT 'DRAFT'::public."RFQStatus" NOT NULL,
    submitted_at timestamp(3) without time zone,
    expired_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rfqs OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    role_id text NOT NULL,
    permission_id text NOT NULL,
    scope public."PermissionScope" DEFAULT 'GLOBAL'::public."PermissionScope" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    level integer DEFAULT 0 NOT NULL,
    is_system_role boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    role_version integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: COLUMN roles.role_version; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.roles.role_version IS 'Auto-incremented version number. Increases whenever role permissions are modified. Used for real-time permission enforcement.';


--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id text NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    description text,
    category text,
    is_public boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    user_id text,
    org_id text,
    plan_id text NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'ACTIVE'::public."SubscriptionStatus" NOT NULL,
    started_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    renewed_at timestamp(3) without time zone,
    expires_at timestamp(3) without time zone,
    cancelled_at timestamp(3) without time zone,
    cancelled_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: tax_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_rates (
    id text NOT NULL,
    region text NOT NULL,
    tax_code text NOT NULL,
    rate numeric(65,30) NOT NULL,
    effective_from timestamp(3) without time zone NOT NULL,
    effective_to timestamp(3) without time zone,
    status public."TaxRateStatus" DEFAULT 'ACTIVE'::public."TaxRateStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tax_rates OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id text NOT NULL,
    user_id text NOT NULL,
    role_id text NOT NULL,
    assigned_by text,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text,
    phone text,
    password_hash text NOT NULL,
    status public."UserStatus" DEFAULT 'PENDING_VERIFICATION'::public."UserStatus" NOT NULL,
    kyc_status public."KYCStatus" DEFAULT 'UNVERIFIED'::public."KYCStatus" NOT NULL,
    display_name text,
    first_name text,
    last_name text,
    avatar_url text,
    default_locale text DEFAULT 'vi'::text NOT NULL,
    timezone text DEFAULT 'Asia/Ho_Chi_Minh'::text NOT NULL,
    last_login_at timestamp(3) without time zone,
    email_verified_at timestamp(3) without time zone,
    phone_verified_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    permissions_updated_at timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
43acd88a-8d14-4440-a2e2-1e504e06fbcf	05b8fc490b9e03d95d86a16c96a83f217ff355521f41938f7d00f27c31a951cb	2025-10-28 09:39:24.338086+00	20251001051655_init		\N	2025-10-28 09:39:24.338086+00	0
bd694c6a-8cfa-477a-8bc6-7d5cf310f74f	33b71e4bf3947577538a25526922897bb7152da0c46702815d3b11faeef15fe1	2025-10-28 09:39:33.170576+00	20251021_add_ready_date		\N	2025-10-28 09:39:33.170576+00	0
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, actor_id, action, target_table, target_id, meta, created_at) FROM stdin;
\.


--
-- Data for Name: business_hours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_hours (id, org_id, timezone, schedule_json, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, code, name, description, icon, sort_order, created_at, updated_at) FROM stdin;
cat-listings	listings	Tin đăng	Quản lý tin đăng container	📋	1	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-users	users	Người dùng	Quản lý người dùng và hồ sơ	👤	2	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-rfq	rfq	Yêu cầu báo giá	Quản lý RFQ (Request for Quote)	📝	3	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-quotes	quotes	Báo giá	Quản lý báo giá	💰	4	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-qa	qa	Hỏi đáp	Quản lý Q&A	💬	5	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-moderation	moderation	Kiểm duyệt	Kiểm duyệt nội dung	🛡️	6	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-inspection	inspection	Giám định	Quản lý giám định container	🔍	7	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-orders	orders	Đơn hàng	Quản lý đơn hàng	🛒	8	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-payments	payments	Thanh toán	Quản lý thanh toán	💳	9	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-delivery	delivery	Vận chuyển	Quản lý vận chuyển	🚚	10	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-reviews	reviews	Đánh giá	Quản lý đánh giá	⭐	11	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-disputes	disputes	Tranh chấp	Quản lý tranh chấp	⚖️	12	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-admin	admin	Quản trị	Quản trị hệ thống	👑	13	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-pricing	pricing	Định giá	Quản lý giá cả	💲	14	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-depot	depot	Kho bãi	Quản lý kho bãi	🏭	15	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-finance	finance	Tài chính	Quản lý tài chính	💵	16	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-support	support	Hỗ trợ	Hỗ trợ khách hàng	🎧	17	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
cat-config	config	Cấu hình	Cấu hình hệ thống	⚙️	18	2025-10-25 09:32:51.535	2025-10-25 09:32:51.535
\.


--
-- Data for Name: commission_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.commission_rules (id, rule_code, name, basis, percent, min_amount, max_amount, conditions_json, effective_from, effective_to, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: config_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.config_entries (id, namespace_id, key, version, status, value_json, checksum, created_by, published_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: config_namespaces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.config_namespaces (id, code, name, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: containers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.containers (id, iso_code, size_ft, type, serial_no, owner_org_id, current_depot_id, condition, quality_standard, csc_plate_no, manufactured_year, last_inspection_date, last_repair_date, status, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, listing_id, buyer_id, seller_id, last_message_at, buyer_unread, seller_unread, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: deliveries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deliveries (id, order_id, pickup_depot_id, dropoff_address, dropoff_contact, schedule_at, "carrierId", carrier_name, tracking_number, status, gps_tracking_id, estimated_delivery, actual_delivery, delivery_notes, created_at, updated_at, booked_at, current_location, delivered_at, delivery_address, delivery_contact, delivery_date, delivery_phone, delivery_time, eir_data, in_transit_at, needs_crane, notes, special_instructions, transportation_fee, carrier_contact_json, transport_method, route_json, driver_info_json, delivery_location_json, delivery_proof_json, eir_data_json, received_by_name, received_by_signature, driver_notes, delivery_method, logistics_company, receipt_confirmed_at, receipt_data_json) FROM stdin;
71eba730-c9ac-476c-aa64-429c656ee0fe	a0a42cff-2996-4c53-a8fc-f062f11f8130	\N	Cát Lái	\N	\N	\N	\N	\N	PENDING	\N	\N	\N	\N	2025-10-16 10:17:51.952	2025-10-16 10:17:51.951	\N	\N	\N	Cát Lái	\N	2025-10-21 06:00:00	\N	13:00	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	logistics	\N	\N	\N
8eb3ae41-a7b7-4134-b512-822a7c604780	a0a42cff-2996-4c53-a8fc-f062f11f8130	\N	Cát Lái	\N	\N	\N	\N	\N	PENDING	\N	\N	\N	\N	2025-10-17 01:56:03.508	2025-10-17 01:56:03.48	\N	\N	\N	Cát Lái	\N	2025-10-20 08:00:00	\N	15:00	\N	\N	f	ok	ok 	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	logistics	\N	\N	\N
eb875faf-b368-4530-ada4-b1b262fcaf0a	a0a42cff-2996-4c53-a8fc-f062f11f8130	\N	Cát Lái	\N	\N	\N	\N	\N	PENDING	\N	\N	\N	\N	2025-10-17 02:02:58.18	2025-10-17 02:02:58.179	\N	\N	\N	Cát Lái	\N	2025-10-20 08:00:00	\N	15:00	\N	\N	f	test	test	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	logistics	\N	\N	\N
66786ca2-df42-4077-b646-fddee8a8c81c	a0a42cff-2996-4c53-a8fc-f062f11f8130	\N	2A đường số 5 Phường An Phú 	\N	\N	\N	\N	\N	PENDING	\N	\N	\N	\N	2025-10-17 02:15:41.817	2025-10-17 02:15:41.771	\N	\N	\N	2A đường số 5 Phường An Phú 	Nguyễn Thị B	2025-10-21 08:00:00	091423546	15:00	\N	\N	f	Tesst 2	Test1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	logistics	\N	\N	\N
1b3a92eb-5448-4710-959d-ddd19a7f1d02	b0a8e8d1-624d-4f38-9cef-419d5ad49be2	\N	2A đường số 5 Phường An Phú 	\N	\N	\N	\N	\N	PENDING	\N	\N	\N	\N	2025-10-21 04:35:41.373	2025-10-21 04:35:41.372	\N	\N	\N	2A đường số 5 Phường An Phú 	Nguyễn Thị B	2025-10-23 06:00:00	05685474643	13:00	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	logistics	\N	\N	\N
c2fa7c37-b04a-492f-9d83-bbec4f99712f	a0a42cff-2996-4c53-a8fc-f062f11f8130	\N	2A đường số 5 Phường An Phú , QUANG NGAI	\N	\N	\N	\N	\N	SCHEDULED	\N	\N	\N	\N	2025-10-22 03:16:58.025	2025-10-22 03:16:58.023	2025-10-22 03:16:58.023	\N	\N	2A đường số 5 Phường An Phú , QUANG NGAI	Nguyễn Thị B	2025-10-23 00:00:00	344964979	17:00	\N	\N	f	\N	\N	500000.000000000000000000000000000000	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	seller_delivers	\N	\N	\N
48c03ab2-8695-4195-8ae1-2a618024fbcc	745201cf-581b-4b4f-a173-718226677fec	\N	2A đường số 5 Phường An Phú , Hồ Chí Minh	\N	\N	\N	xv	12913	DELIVERED	\N	2025-10-24 04:05:00	\N	\N	2025-10-22 02:56:32.963	2025-10-22 04:36:32.825	2025-10-22 02:56:32.961	Hồ Chi Minh	2025-10-21 21:36:00	2A đường số 5 Phường An Phú , Hồ Chí Minh	Nguyễn Thị B	2025-10-25 00:00:00	0344964979	15:00	\N	2025-10-22 03:58:57.647	f		\N	500000.000000000000000000000000000000	\N	container_truck	"{\\"checkpoints\\":[{\\"location\\":\\"Thủ Đức\\",\\"timestamp\\":\\"2025-10-22T04:05:48.516Z\\"}],\\"photos\\":[]}"	"{\\"name\\":\\"Nguyễn Văn A\\",\\"phone\\":\\"0897865754\\",\\"vehicleNumber\\":\\"51D-12345\\"}"	"{\\"address\\":\\"Thủ Đức, Hồ Chí Minh\\"}"	null	null	Nguyễn văn a	\N	\N	seller_delivers	\N	\N	\N
c16d99c8-4144-4af3-aff9-fc179c52c505	72682c91-7499-4f0c-85a6-b2f78a75dbcd	\N	Khu vực cảng Sài Gòn, Quận 4, TP.HCM	\N	\N	\N	\N	\N	DELIVERED	\N	\N	\N	\N	2025-10-22 02:35:11.442	2025-10-22 04:49:51.74	2025-10-22 02:35:11.437	\N	2025-10-21 21:49:00	Khu vực cảng Sài Gòn, Quận 4, TP.HCM	N/A	2025-10-30 00:00:00	N/A	13:00	\N	\N	f	\N	\N	0.000000000000000000000000000000	\N	\N	\N	\N	"{\\"address\\":\\"Thủ Đức, Hồ Chí Minh\\"}"	null	null	Nguyễn văn BAAA	\N	\N	self_pickup	\N	\N	\N
34b7004a-0633-4602-a5ba-38f7807909e7	72682c91-7499-4f0c-85a6-b2f78a75dbcd	\N	Khu vực cảng Sài Gòn, Quận 4, TP.HCM	\N	\N	\N	\N	\N	SCHEDULED	\N	\N	\N	\N	2025-10-22 02:47:39.022	2025-10-22 06:35:10.158	2025-10-22 02:47:38.994	\N	\N	Khu vực cảng Sài Gòn, Quận 4, TP.HCM	N/A	2025-10-23 00:00:00	N/A	15:00	\N	\N	f	\N	\N	0.000000000000000000000000000000	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	self_pickup	\N	2025-10-22 06:35:10.158	{"notes": "", "photos": ["data:image/png;base64,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"], "condition": "GOOD", "signature": "", "received_at": "2025-10-22T06:35:10.124Z", "received_by": "ttttt", "confirmed_at": "2025-10-22T06:35:10.135Z"}
fdea7440-ed7b-4e08-8905-c092221020ed	6ce9b8c2-2c54-479a-8f2e-831c28ee58dd	\N	Cát Lái smart	\N	\N	\N	\N	\N	DELIVERED	\N	\N	\N	\N	2025-10-20 10:09:34.289	2025-10-22 07:19:03.979	\N	\N	2025-10-22 21:59:00	Cát Lái smart	\N	2025-10-24 03:00:00	\N	10:00	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	"{\\"address\\":\\"Thủ Đức, Hồ Chí Minh\\"}"	null	null	Nguyễn văn BAAAdfdf	\N	\N	logistics	\N	2025-10-22 07:19:03.979	{"notes": "không dúng như yêu cầu", "photos": ["data:image/png;base64,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gAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAA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", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnIAAAJyCAYAAABALi2VAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAACcpSURBVHja7N19jF3lfej731prv47HYwbb2OAWamS7kBJOpCAnIZyjGzW6VKkUqWkr3dNEitRWR0p1qlvpVr1qe9OjtEpVcVpFisJRaZM0uWmivBRCiwgO0NASl1enfmkMxDge8xJbGIPxvO2Zvfda6/xh9s7YGJKUGvba8/lIlsdjY+Bnz+zvPGut50nKsgwA3jiPPPLI9hdeeOHQ0aNHY35+PmZnZ2NxcTF6vV50u93odDqxtLQUS0tL0e/3Y3l5OZaWlmJ5eTm63W50u93o9/vx0ksvRZ7n0e12o9frRZ7nURRFREQkSTJ8m3+fJEmiLMv4rd/6rXtuvvnm/9NEGEU1IwD4j3HkyJHs5MmTVz733HNXz87Obl5eXp6YnZ3d/Pzzz28/ceLEjpMnT17+4osvTs3Ozkan04mIiG63Owy2iIiyLKPf70e/349GozGMs6IooizL4bdBpBVFEXmehy/KQcgB8GN48sknJ44dO3bN3NzcxqNHj+48dOjQe5577rnti4uL051Opzk/Pz9cUet0OjE3NzdccVu5SjZY8VkpTdPh24uLi8Nw+0kkSXLe3xsQcgCr0je/+c33PvLIIx86evTozuPHj1998uTJePbZZ+PUqVOxtLQ0jLBGoxERZ1bWut3uMKbSNI0sy6JWq521qpamaSRJMvxnBr8+SZJI0/Ss1bjzBdvK7we/x8rvASEHsGocOHBg85NPPvl/PP/881cePnz4vzz88MM37tu3L5aXl6PRaAzvYxusnJVlGVmWRZZlURTFMOoiItrtduR5Hv1+fxhkP4k8z1813lZGn2gDIQewKu3ateu9u3fv/m+PPfbYjUeOHJmamZmJ2dnZs4IpSZJYu3ZtFEUR3W73FSGV5/lZ0dVut2NycjKef/75swLs3BW0lStyg0uhg3/fyh8XRTF838rVt8F9dYCQA1gVvv3tb7/9wIED79+7d+8Hdu/efc0LL7wQp0+fHl6+XPnU52Clrdvtxuzs7PD9jUYjiqKIXq83/HVpmkav14uyLKPT6QwfZog4c1k1TdPh779yZe58q27DT9ArLsO+1qXV8/04SZLX/L0BIQdQCffcc8979u3b90v79u17/7Fjx644fvx4HDlyZLhFx8p70FauevV6vWGsDeJtsB3IILQGT5iu/GcHcRcRw99/5erZyvgbPHW6MsQG4Xa+FbdzY23lr3eJFYQcwFjYv3//lnvvvfd3Z2Zmdn73u9+9/siRI3Hy5MnhStlrPdV57vsHDy6c69zQWnnP2mvdD/dqkfbjhNjKXyPcACEHjI2DBw9u2LNnz3+9//77P7Jnz56rn3zyyVhaWjrrydHBJU4AIQcwAh566KGr//Iv//Lvv/zlL28fPF2aZdlZ96kNtvOweS4g5ADeZAcPHtxw++23/9k//MM//MbevXuj2WxGu90ebg9Sr9djYmJi+ETpuZczB/e3AQg5gDfI448/Pn3PPff87u233/4Hjz/+eMzOzg4fShgEWpZlZ73vfJxDCgg5gDfIfffdd/2uXbv+YO/evb946NCheOqpp6LRaAwfQmi328PD5Ac/HmzEO9ibbeXTqUIOEHIAF9idd975i//0T//024888siNe/bsicXFxZiYmIh2ux2dTieazWbUarVYWFiIiB8ek9XpdIZbhpx7T1ySJFGv18/7JCqAkAN4nQ4fPty8+eab77rjjjve8/3vf394BFZExPLycuR5Hq1WK5aWlobHZ0Wc2fttcEzWylCr1+uRpmn0+/3I81zEAUIO4EL4i7/4i0/81V/91e8cOnRo+L6VpxQM3l55rumPCrPXul8OQMgBvE5/8zd/8ztf+tKXPrFnz57hpVIAhBwwwp544ompW2655fa///u/f8+LL744PMcUACEHjLBvfOMbN37+85//3K5duzbPzs5GrVaLWs2nJgAhB4ysAwcObP7CF77wuX/8x3+8ce/evZEkyfBJVBv1Agg5YER9/vOf/+2Pf/zjn3zyyScjSZKo1WqRJEn0+/3h06cR4clSACEHjIqZmZnsj/7ojw797d/+7ZX1ej2azebw+KyyLM96MtXlVQAhB4yI+++//+2f/OQn77nrrrumBxvyLi0tRZIkw4BLkiRarVb0+30POwAIOWAU3Hnnnb/4hS984dP33Xff9OLiYiRJEouLi6/4dWVZRqfTMTBGwuBoNxBywKr15S9/+cOf+cxnPvfII4/E3NxcJEkSSZJEmqZnXUoFQMgBI+TP/uzP/tc3vvGNj3z729+O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"], "condition": "MAJOR_DAMAGE", "signature": "", "received_at": "2025-10-22T07:19:03.936Z", "received_by": "Nguyễn Văn Anh", "confirmed_at": "2025-10-22T07:19:03.961Z"}
57ca3baa-14cc-4dfb-9766-d3dd9bd8cb0b	a4d89d1a-d4de-4d09-9cb7-2360ad985799	\N	Khu công nghiệp Đình Vũ, Hải Phong	\N	\N	\N	\N	\N	DELIVERED	\N	\N	\N	\N	2025-10-23 04:50:15.88	2025-10-23 05:15:20.749	2025-10-23 04:50:15.878	\N	2025-10-23 22:06:00	Khu công nghiệp Đình Vũ, Hải Phong	N/A	2025-10-24 00:00:00	N/A	15:00	\N	\N	f	\N	\N	0.000000000000000000000000000000	\N	\N	\N	\N	"{\\"address\\":\\"Thủ Đức, Hồ Chí Minh\\"}"	null	null	Nguyễn Văn Anh	\N	\N	self_pickup	\N	2025-10-23 05:15:20.749	{"notes": "", "photos": ["data:image/jpeg;base64,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", "data:image/jpeg;base64,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"], "condition": "GOOD", "signature": "", "received_at": "2025-10-23T05:15:20.725Z", "received_by": "Nguyễn Văn Anh", "confirmed_at": "2025-10-23T05:15:20.735Z"}
\.


--
-- Data for Name: delivery_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_events (id, delivery_id, event_type, payload, location, occurred_at, created_at) FROM stdin;
\.


--
-- Data for Name: depot_calendars; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.depot_calendars (id, depot_id, closed_dates_json, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: depot_stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.depot_stock_movements (id, depot_id, container_id, owner_org_id, movement_type, direction, ref_doc_type, ref_doc_id, reason, occurred_at, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: depot_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.depot_users (id, depot_id, user_id, role_in_depot, permissions, assigned_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: depots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.depots (id, name, code, address, province, city, geo_point, capacity_teu, contact, operating_hours, services, status, created_at, updated_at, deleted_at) FROM stdin;
3feea6b3-d262-4121-ab34-b5f7a2b0e393	Depot Saigon Port	SGN01	Khu vực cảng Sài Gòn, Quận 4, TP.HCM	TP. Hồ Chí Minh	Quận 4	10.7769,106.7009	5000	"{\\"phone\\":\\"+84-28-1234-5678\\",\\"email\\":\\"sgn01@depot.vn\\",\\"manager\\":\\"Nguyễn Văn A\\"}"	"{\\"weekdays\\":\\"07:00-17:00\\",\\"saturday\\":\\"07:00-12:00\\",\\"sunday\\":\\"Closed\\"}"	"[\\"storage\\",\\"inspection\\",\\"repair\\",\\"washing\\"]"	ACTIVE	2025-10-09 07:51:30.602	2025-10-09 07:51:30.6	\N
6edf4c7f-c062-43a8-970e-605d5b4aee9a	Depot Hai Phong	HPH01	Khu công nghiệp Đình Vũ, Hải Phong	Hải Phòng	Hải An	20.8449,106.7880	3000	"{\\"phone\\":\\"+84-225-1234-567\\",\\"email\\":\\"hph01@depot.vn\\",\\"manager\\":\\"Trần Văn B\\"}"	"{\\"weekdays\\":\\"06:00-18:00\\",\\"saturday\\":\\"06:00-12:00\\",\\"sunday\\":\\"Closed\\"}"	"[\\"storage\\",\\"inspection\\",\\"repair\\"]"	ACTIVE	2025-10-09 07:51:30.602	2025-10-09 07:51:30.6	\N
8059611a-7462-4cd0-8ea0-495050c93f65	Depot Da Nang	DAD01	Khu vực cảng Đà Nẵng, Quận Sơn Trà, Đà Nẵng	Đà Nẵng	Sơn Trà	16.0544,108.2022	2000	"{\\"phone\\":\\"+84-236-1234-567\\",\\"email\\":\\"dad01@depot.vn\\",\\"manager\\":\\"Lê Thị C\\"}"	"{\\"weekdays\\":\\"07:00-17:00\\",\\"saturday\\":\\"07:00-12:00\\",\\"sunday\\":\\"Closed\\"}"	"[\\"storage\\",\\"inspection\\"]"	ACTIVE	2025-10-09 07:51:30.602	2025-10-09 07:51:30.6	\N
5d2dfc1e-77d8-4fd8-9e0b-d7920c3d4d98	Depot Can Tho	VCA01	Khu công nghiệp Trà Nóc, Cần Thơ	Cần Thơ	Bình Thủy	10.0452,105.7469	1500	"{\\"phone\\":\\"+84-292-1234-567\\",\\"email\\":\\"vca01@depot.vn\\",\\"manager\\":\\"Phạm Văn D\\"}"	"{\\"weekdays\\":\\"07:00-17:00\\",\\"saturday\\":\\"07:00-12:00\\",\\"sunday\\":\\"Closed\\"}"	"[\\"storage\\",\\"washing\\"]"	ACTIVE	2025-10-09 07:51:30.602	2025-10-09 07:51:30.6	\N
54281c5f-b0ee-4d7d-a18d-a2ff6dd48398	Depot Vung Tau	VUT01	Khu công nghiệp Phú Mỹ, Vũng Tàu	Bà Rịa - Vũng Tàu	Phú Mỹ	10.6004,107.2695	2500	"{\\"phone\\":\\"+84-254-1234-567\\",\\"email\\":\\"vut01@depot.vn\\",\\"manager\\":\\"Hoàng Văn E\\"}"	"{\\"weekdays\\":\\"06:00-18:00\\",\\"saturday\\":\\"06:00-14:00\\",\\"sunday\\":\\"Closed\\"}"	"[\\"storage\\",\\"inspection\\",\\"repair\\",\\"washing\\"]"	ACTIVE	2025-10-09 07:51:30.602	2025-10-09 07:51:30.6	\N
762748da-aa8e-4efd-b542-6f99c6f8cbb5	Test Depot	TEST_DEPOT	123 Test Street	Ho Chi Minh	Ho Chi Minh City	\N	1000	\N	\N	\N	ACTIVE	2025-10-11 03:05:24.324	2025-10-11 03:05:24.321	\N
\.


--
-- Data for Name: dispute_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispute_audit_logs (id, dispute_id, user_id, action, old_value, new_value, metadata_json, created_at) FROM stdin;
\.


--
-- Data for Name: dispute_evidence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispute_evidence (id, dispute_id, uploader_id, file_url, file_type, note, created_at) FROM stdin;
\.


--
-- Data for Name: dispute_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispute_messages (id, dispute_id, sender_id, message, attachments_json, is_internal, is_resolution, created_at, read_at) FROM stdin;
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disputes (id, order_id, raised_by, status, reason, description, resolution, resolved_by, resolved_at, closed_at, created_at, updated_at, assigned_to, evidence_json, requested_resolution, requested_amount, admin_notes, resolution_notes, resolution_amount, priority, responded_at, escalated_at) FROM stdin;
DSP-1761117543990-sbiykm	6ce9b8c2-2c54-479a-8f2e-831c28ee58dd	user-buyer	OPEN	Container damaged on delivery	không dúng như yêu cầu	\N	\N	\N	\N	2025-10-22 07:19:03.991	2025-10-22 07:19:03.991	\N	{"notes": "không dúng như yêu cầu", "photos": ["data:image/png;base64,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gAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAA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", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnIAAAJyCAYAAABALi2VAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAACcpSURBVHja7N19jF3lfej731prv47HYwbb2OAWamS7kBJOpCAnIZyjGzW6VKkUqWkr3dNEitRWR0p1qlvpVr1qe9OjtEpVcVpFisJRaZM0uWmivBRCiwgO0NASl1enfmkMxDge8xJbGIPxvO2Zvfda6/xh9s7YGJKUGvba8/lIlsdjY+Bnz+zvPGut50nKsgwA3jiPPPLI9hdeeOHQ0aNHY35+PmZnZ2NxcTF6vV50u93odDqxtLQUS0tL0e/3Y3l5OZaWlmJ5eTm63W50u93o9/vx0ksvRZ7n0e12o9frRZ7nURRFREQkSTJ8m3+fJEmiLMv4rd/6rXtuvvnm/9NEGEU1IwD4j3HkyJHs5MmTVz733HNXz87Obl5eXp6YnZ3d/Pzzz28/ceLEjpMnT17+4osvTs3Ozkan04mIiG63Owy2iIiyLKPf70e/349GozGMs6IooizL4bdBpBVFEXmehy/KQcgB8GN48sknJ44dO3bN3NzcxqNHj+48dOjQe5577rnti4uL051Opzk/Pz9cUet0OjE3NzdccVu5SjZY8VkpTdPh24uLi8Nw+0kkSXLe3xsQcgCr0je/+c33PvLIIx86evTozuPHj1998uTJePbZZ+PUqVOxtLQ0jLBGoxERZ1bWut3uMKbSNI0sy6JWq521qpamaSRJMvxnBr8+SZJI0/Ss1bjzBdvK7we/x8rvASEHsGocOHBg85NPPvl/PP/881cePnz4vzz88MM37tu3L5aXl6PRaAzvYxusnJVlGVmWRZZlURTFMOoiItrtduR5Hv1+fxhkP4k8z1813lZGn2gDIQewKu3ateu9u3fv/m+PPfbYjUeOHJmamZmJ2dnZs4IpSZJYu3ZtFEUR3W73FSGV5/lZ0dVut2NycjKef/75swLs3BW0lStyg0uhg3/fyh8XRTF838rVt8F9dYCQA1gVvv3tb7/9wIED79+7d+8Hdu/efc0LL7wQp0+fHl6+XPnU52Clrdvtxuzs7PD9jUYjiqKIXq83/HVpmkav14uyLKPT6QwfZog4c1k1TdPh779yZe58q27DT9ArLsO+1qXV8/04SZLX/L0BIQdQCffcc8979u3b90v79u17/7Fjx644fvx4HDlyZLhFx8p70FauevV6vWGsDeJtsB3IILQGT5iu/GcHcRcRw99/5erZyvgbPHW6MsQG4Xa+FbdzY23lr3eJFYQcwFjYv3//lnvvvfd3Z2Zmdn73u9+9/siRI3Hy5MnhStlrPdV57vsHDy6c69zQWnnP2mvdD/dqkfbjhNjKXyPcACEHjI2DBw9u2LNnz3+9//77P7Jnz56rn3zyyVhaWjrrydHBJU4AIQcwAh566KGr//Iv//Lvv/zlL28fPF2aZdlZ96kNtvOweS4g5ADeZAcPHtxw++23/9k//MM//MbevXuj2WxGu90ebg9Sr9djYmJi+ETpuZczB/e3AQg5gDfI448/Pn3PPff87u233/4Hjz/+eMzOzg4fShgEWpZlZ73vfJxDCgg5gDfIfffdd/2uXbv+YO/evb946NCheOqpp6LRaAwfQmi328PD5Ac/HmzEO9ibbeXTqUIOEHIAF9idd975i//0T//024888siNe/bsicXFxZiYmIh2ux2dTieazWbUarVYWFiIiB8ek9XpdIZbhpx7T1ySJFGv18/7JCqAkAN4nQ4fPty8+eab77rjjjve8/3vf394BFZExPLycuR5Hq1WK5aWlobHZ0Wc2fttcEzWylCr1+uRpmn0+/3I81zEAUIO4EL4i7/4i0/81V/91e8cOnRo+L6VpxQM3l55rumPCrPXul8OQMgBvE5/8zd/8ztf+tKXPrFnz57hpVIAhBwwwp544ompW2655fa///u/f8+LL744PMcUACEHjLBvfOMbN37+85//3K5duzbPzs5GrVaLWs2nJgAhB4ysAwcObP7CF77wuX/8x3+8ce/evZEkyfBJVBv1Agg5YER9/vOf/+2Pf/zjn3zyyScjSZKo1WqRJEn0+/3h06cR4clSACEHjIqZmZnsj/7ojw797d/+7ZX1ej2azebw+KyyLM96MtXlVQAhB4yI+++//+2f/OQn77nrrrumBxvyLi0tRZIkw4BLkiRarVb0+30POwAIOWAU3Hnnnb/4hS984dP33Xff9OLiYiRJEouLi6/4dWVZRqfTMTBGwuBoNxBywKr15S9/+cOf+cxnPvfII4/E3NxcJEkSSZJEmqZnXUoFQMgBI+TP/uzP/tc3vvGNj3z729+O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"], "condition": "MAJOR_DAMAGE", "signature": "", "received_at": "2025-10-22T07:19:03.936Z", "received_by": "Nguyễn Văn Anh"}	FULL_REFUND	3740000000.00	\N	\N	\N	HIGH	\N	\N
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, order_id, doc_type, number, file_url, file_size, mime_type, issued_at, issued_by, created_at, updated_at, document_number, metadata, pickup_code, status, valid_until) FROM stdin;
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (id, user_id, listing_id, created_at) FROM stdin;
\.


--
-- Data for Name: feature_flags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feature_flags (id, code, name, description, enabled, rollout_json, effective_from, effective_to, version, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fee_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fee_schedules (id, fee_code, name, calc_type, currency, amount, percent, tiers_json, scope, effective_from, effective_to, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: form_schemas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_schemas (id, code, name, scope, json_schema, ui_schema, version, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: i18n_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.i18n_translations (id, namespace, key, locale, value, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inspection_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspection_items (id, inspection_id, code, name, severity, note, photo_url, rating, created_at) FROM stdin;
\.


--
-- Data for Name: inspections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspections (id, listing_id, depot_id, requested_by, inspector_id, status, standard, scheduled_at, started_at, completed_at, summary, overall_rating, recommendations, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: integration_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integration_configs (id, vendor_code, name, config_json, secrets_ref, version, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: listing_facets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listing_facets (id, listing_id, key, value, created_at) FROM stdin;
a3cd737f-ec28-49db-9261-7f53240319c3	d0c5c376-acd1-4f91-b7d4-2b82f8f7a1b7	size	20	2025-10-09 10:32:23.325
25d519d1-53a0-478d-b553-ce57b0ed5fa8	d0c5c376-acd1-4f91-b7d4-2b82f8f7a1b7	type	HC	2025-10-09 10:32:23.325
bed26aa3-5601-4276-8ff6-1553f35c3230	d0c5c376-acd1-4f91-b7d4-2b82f8f7a1b7	standard	IICL	2025-10-09 10:32:23.325
c50b330a-dd34-4d02-8e4a-7b61559b5bda	d0c5c376-acd1-4f91-b7d4-2b82f8f7a1b7	condition	new	2025-10-09 10:32:23.325
40bedcd9-1d46-4d4e-8ae8-98ab5ae55ffa	92bbb16f-2bd7-42d1-aa3c-0f130a7d2ead	size	40	2025-10-10 04:03:16.085
e79c3385-000a-430e-81a2-7cf3e08e5066	92bbb16f-2bd7-42d1-aa3c-0f130a7d2ead	type	FR	2025-10-10 04:03:16.085
a3627a64-2e3c-467e-aec4-75a4aeaddb93	92bbb16f-2bd7-42d1-aa3c-0f130a7d2ead	standard	CW	2025-10-10 04:03:16.085
4fa95a90-b518-43b5-bb56-65a904965cd3	92bbb16f-2bd7-42d1-aa3c-0f130a7d2ead	condition	new	2025-10-10 04:03:16.085
3297d6ae-a56f-4188-b2bc-f1c6cef2ec7a	da4cb168-ce2a-43f2-9e73-96f98abe71d2	type	FR	2025-10-10 06:35:13.667
792fa8ca-ee26-42a3-83a6-a5b0704b4def	da4cb168-ce2a-43f2-9e73-96f98abe71d2	size	45	2025-10-10 06:35:13.667
9d658df4-526b-46bf-b2c5-d6307e952982	da4cb168-ce2a-43f2-9e73-96f98abe71d2	standard	CW	2025-10-10 06:35:13.667
d734c64d-654a-4b6b-b849-e54fedd9803c	da4cb168-ce2a-43f2-9e73-96f98abe71d2	condition	used	2025-10-10 06:35:13.667
f593b04d-5209-49e6-b2dc-77540f9a575a	75294c88-f97a-44ae-8f35-308e41fc93b5	size	40	2025-10-10 09:29:46.698
7dfa76f7-8bee-4d4f-a144-1b26067a4b96	75294c88-f97a-44ae-8f35-308e41fc93b5	type	FR	2025-10-10 09:29:46.698
ff103727-fb49-460f-9ac5-fa26a01486d1	75294c88-f97a-44ae-8f35-308e41fc93b5	standard	CW	2025-10-10 09:29:46.698
5f2b1613-91c2-4faf-a32e-71ebf07b1dc7	75294c88-f97a-44ae-8f35-308e41fc93b5	condition	new	2025-10-10 09:29:46.698
b0f61942-47fb-4b6b-962b-347bf7678518	8db66227-c31c-42d3-9e75-b77cc6809495	size	45	2025-10-10 09:40:38.245
46098dcf-f698-406c-bfdd-4d7f9a339c77	8db66227-c31c-42d3-9e75-b77cc6809495	type	DRY	2025-10-10 09:40:38.245
d4ac3d44-72fe-4e43-ae6c-15cb2730b58f	8db66227-c31c-42d3-9e75-b77cc6809495	standard	CW	2025-10-10 09:40:38.245
2924f89e-0ab4-479c-a147-d9c703b53fbb	8db66227-c31c-42d3-9e75-b77cc6809495	condition	new	2025-10-10 09:40:38.245
f9e810a4-1451-480d-893f-4e2e0c1550b7	49ee0f29-1330-4c94-a2d2-4bcf08ef157b	size	20	2025-10-10 09:53:54.423
9b0fa499-8418-4f14-b452-ea745fd77cb7	49ee0f29-1330-4c94-a2d2-4bcf08ef157b	type	FR	2025-10-10 09:53:54.423
717d41b2-ed0c-4ddb-acf7-32213323b105	49ee0f29-1330-4c94-a2d2-4bcf08ef157b	standard	CW	2025-10-10 09:53:54.423
6ade85eb-516b-434f-87a7-5f50a10614e9	49ee0f29-1330-4c94-a2d2-4bcf08ef157b	condition	new	2025-10-10 09:53:54.423
7072c744-f0df-4862-a8d6-14b04a069bbb	0f679513-741b-43c8-8881-1d104bdbd354	size	40	2025-10-10 09:55:32.569
d012261c-7328-4efc-bc6d-18b6352e4997	0f679513-741b-43c8-8881-1d104bdbd354	type	FR	2025-10-10 09:55:32.569
4de25638-2bda-4170-b5ef-f0911799e3c7	0f679513-741b-43c8-8881-1d104bdbd354	standard	IICL	2025-10-10 09:55:32.569
a7469c26-2ad1-417d-8b73-18787aa0b700	0f679513-741b-43c8-8881-1d104bdbd354	condition	new	2025-10-10 09:55:32.569
bb96c216-2e80-47f7-9b3f-d5ba90ad729f	3a66ef48-dbd4-461b-9beb-f7c3d52b0ed6	size	10	2025-10-10 10:04:53.264
0d8e7414-c545-4dbe-aebf-570519f0a620	3a66ef48-dbd4-461b-9beb-f7c3d52b0ed6	type	HC	2025-10-10 10:04:53.264
4b304664-abd9-487b-b75e-3a2af68f1100	3a66ef48-dbd4-461b-9beb-f7c3d52b0ed6	standard	IICL	2025-10-10 10:04:53.264
48685ea9-9715-4d3b-88cb-6cba93c6fb8b	3a66ef48-dbd4-461b-9beb-f7c3d52b0ed6	condition	new	2025-10-10 10:04:53.264
69660e04-f65b-4b30-84ff-f9fa45dac694	ac051cf9-a7ca-49c0-82c3-e726fb8104b3	size	20	2025-10-10 10:11:20.515
a5e217db-c1f0-4216-bff4-8ed229513676	ac051cf9-a7ca-49c0-82c3-e726fb8104b3	type	HC	2025-10-10 10:11:20.515
5138daed-7d56-47c6-945c-16a8712f5442	ac051cf9-a7ca-49c0-82c3-e726fb8104b3	standard	IICL	2025-10-10 10:11:20.515
311c8f0a-2bf6-4780-a3a9-6d10ec5c4914	ac051cf9-a7ca-49c0-82c3-e726fb8104b3	condition	used	2025-10-10 10:11:20.515
e35d48a3-4846-4c9d-a4de-5238c913867c	c2ba5e55-3767-4821-a082-e8929a7524da	size	40	2025-10-11 02:54:12.839
1f70504a-1f4e-492e-bed8-eeece0192b5f	c2ba5e55-3767-4821-a082-e8929a7524da	type	FR	2025-10-11 02:54:12.839
c91b9310-649a-4f91-a14c-df073fc28ae0	c2ba5e55-3767-4821-a082-e8929a7524da	standard	WWT	2025-10-11 02:54:12.839
005ef068-648f-42aa-863e-12881674c416	c2ba5e55-3767-4821-a082-e8929a7524da	condition	used	2025-10-11 02:54:12.839
dded5260-e5f6-4165-8702-aef8261f40ef	8aeff3d2-042c-43af-b449-7c6d1f567625	size	40	2025-10-11 02:54:22.401
8597d1f0-7a33-40ab-b4c2-8a3d9a69245d	8aeff3d2-042c-43af-b449-7c6d1f567625	type	FR	2025-10-11 02:54:22.401
a22c5253-bedf-49ef-8320-c2e88c068ba5	8aeff3d2-042c-43af-b449-7c6d1f567625	standard	WWT	2025-10-11 02:54:22.401
77176bee-dacc-4961-9217-cc12e4593a12	8aeff3d2-042c-43af-b449-7c6d1f567625	condition	used	2025-10-11 02:54:22.401
f69e5687-ac2f-45f0-a65d-c381e76164a5	4ce52ae4-d9c4-443d-8f4c-ba77be285b58	size	20	2025-10-11 03:05:59.328
e72d929b-4d31-4660-8b8d-2dca1ec37484	4ce52ae4-d9c4-443d-8f4c-ba77be285b58	type	DRY	2025-10-11 03:05:59.328
cc0078fb-0771-40a5-b74f-d26572b3aaf6	4ce52ae4-d9c4-443d-8f4c-ba77be285b58	standard	IICL	2025-10-11 03:05:59.328
569ff37f-c7db-4e47-b067-b762382cfb6e	4ce52ae4-d9c4-443d-8f4c-ba77be285b58	condition	used	2025-10-11 03:05:59.328
b4971ee5-737a-4bae-8b0d-6dcd62db4ff9	c68c426a-a94c-472f-b7f6-55614df4486e	size	20	2025-10-11 03:07:20.896
3ac94ee1-4635-417a-bfcb-99e080d80f04	c68c426a-a94c-472f-b7f6-55614df4486e	type	DRY	2025-10-11 03:07:20.896
4b9a780a-43b1-4b7e-8da0-bc06bffb2f01	c68c426a-a94c-472f-b7f6-55614df4486e	standard	IICL	2025-10-11 03:07:20.896
c46dda66-a602-4bfd-a9d0-81ae47323747	c68c426a-a94c-472f-b7f6-55614df4486e	condition	used	2025-10-11 03:07:20.896
0b4ba0e4-0edb-465a-ab1d-399180836514	1b1051fa-a69c-42f3-929d-39e7d7099b2a	size	20	2025-10-11 03:07:29.932
c6c9a5f3-cef7-4f98-b42e-66a3c586d9bf	1b1051fa-a69c-42f3-929d-39e7d7099b2a	type	DRY	2025-10-11 03:07:29.932
6f0d1678-0b45-48da-b6e5-8ec6811adc07	1b1051fa-a69c-42f3-929d-39e7d7099b2a	standard	IICL	2025-10-11 03:07:29.932
6d99f691-1f12-4fe0-8179-d8e48dbdfa9d	1b1051fa-a69c-42f3-929d-39e7d7099b2a	condition	used	2025-10-11 03:07:29.932
4ef41d0d-507f-4f0c-9d50-1fecf677d181	67a0ad73-11a6-47e2-9cf5-1da8ea1e4e2f	size	20	2025-10-11 03:07:47.413
e2f963bc-b0d2-4f6a-b86d-b8ff375dbf90	67a0ad73-11a6-47e2-9cf5-1da8ea1e4e2f	type	DRY	2025-10-11 03:07:47.413
cb1df311-1598-4655-9f89-92f8c6263743	67a0ad73-11a6-47e2-9cf5-1da8ea1e4e2f	standard	IICL	2025-10-11 03:07:47.413
d73d4f08-88d4-4be0-add8-aeab053ded35	67a0ad73-11a6-47e2-9cf5-1da8ea1e4e2f	condition	used	2025-10-11 03:07:47.413
74574f9b-8101-4965-91c3-f50629d04a53	324e36cd-b6dc-4837-9fb6-498353b7de8d	size	20	2025-10-11 03:08:00.328
3f1347bf-eca3-4f3f-9d18-c054bf9c6b80	324e36cd-b6dc-4837-9fb6-498353b7de8d	type	DRY	2025-10-11 03:08:00.328
b614e031-b1f4-435a-9fbe-04054d4f4ae5	324e36cd-b6dc-4837-9fb6-498353b7de8d	standard	IICL	2025-10-11 03:08:00.328
85d8ee4f-3219-4a92-a2a6-75e0fb63bbe4	324e36cd-b6dc-4837-9fb6-498353b7de8d	condition	used	2025-10-11 03:08:00.328
2a72e558-bb03-445f-959b-b632714298b6	4947d637-4ceb-48c0-b279-4e90459bd1e1	size	20	2025-10-11 03:08:27.876
c5561477-6673-4a23-9515-c9deb4a5c6d7	4947d637-4ceb-48c0-b279-4e90459bd1e1	type	DRY	2025-10-11 03:08:27.876
1721d5f3-b149-4f9b-ba1c-bafd83b4b1a2	4947d637-4ceb-48c0-b279-4e90459bd1e1	standard	IICL	2025-10-11 03:08:27.876
fbd73a86-b46d-4c36-8296-14c24b16b751	4947d637-4ceb-48c0-b279-4e90459bd1e1	condition	used	2025-10-11 03:08:27.876
7603ac8c-9447-445e-9730-a2add390bdfb	fa2ffd5e-5c87-4c36-a114-a0ddd53f87a7	size	20	2025-10-11 03:08:41.836
ab83275e-319d-4090-bb4d-60d9443af70d	fa2ffd5e-5c87-4c36-a114-a0ddd53f87a7	type	DRY	2025-10-11 03:08:41.836
1ea8ed38-7eae-477c-ba6e-a087f1f8e269	fa2ffd5e-5c87-4c36-a114-a0ddd53f87a7	standard	IICL	2025-10-11 03:08:41.836
61b43daa-17ce-4eae-908d-9d5c638dabac	fa2ffd5e-5c87-4c36-a114-a0ddd53f87a7	condition	used	2025-10-11 03:08:41.836
5c2789a4-1cf6-4b5f-9e58-09fce47a8461	32d899e2-d94a-4647-a173-b3e2095be8ba	size	20	2025-10-11 03:09:49.134
6ef52e6d-5115-4f62-a311-ee0c90e77f6e	32d899e2-d94a-4647-a173-b3e2095be8ba	type	DRY	2025-10-11 03:09:49.134
7683a05e-a61b-44de-ba8a-3e874420280f	32d899e2-d94a-4647-a173-b3e2095be8ba	standard	IICL	2025-10-11 03:09:49.134
1335fcb6-7f5e-4eb1-92ef-cfad32ec02ab	32d899e2-d94a-4647-a173-b3e2095be8ba	condition	used	2025-10-11 03:09:49.134
96d35cbc-4ac3-4ff1-a9d2-8f8efd9deccf	af274334-c1e6-4498-b8a6-b5c9a982ebd3	size	20	2025-10-11 03:09:58.011
ac27575a-8d60-41ef-baa3-7890c6844043	af274334-c1e6-4498-b8a6-b5c9a982ebd3	type	DRY	2025-10-11 03:09:58.011
92ff0cc4-fd12-4466-9cdf-8c5d92d3bec9	af274334-c1e6-4498-b8a6-b5c9a982ebd3	standard	IICL	2025-10-11 03:09:58.011
4e9053f1-56c5-41cb-8ed7-41488549ecc3	af274334-c1e6-4498-b8a6-b5c9a982ebd3	condition	used	2025-10-11 03:09:58.011
2e9d3f8c-9223-446d-9cd4-579a17f7aaa2	3b42cd41-02ea-4f07-a350-c52b6154284e	size	20	2025-10-11 03:10:08.037
3a1c07f6-cfd3-4f09-ad01-6e8f8cd7e023	3b42cd41-02ea-4f07-a350-c52b6154284e	type	DRY	2025-10-11 03:10:08.037
84993fe5-d31f-4b3a-bcd9-508701974cd6	3b42cd41-02ea-4f07-a350-c52b6154284e	standard	IICL	2025-10-11 03:10:08.037
dc82ce67-ab94-4281-ac14-c26e0cec9719	3b42cd41-02ea-4f07-a350-c52b6154284e	condition	used	2025-10-11 03:10:08.037
ad389d57-c923-42ac-9fa1-48f693651a0d	58e542b1-188a-4152-8799-2f63a14b9cb3	size	45	2025-10-11 03:13:35.236
a1691ae3-3de0-42ed-9985-187dd6fb0fd6	58e542b1-188a-4152-8799-2f63a14b9cb3	type	FR	2025-10-11 03:13:35.236
30aeb8fa-ead2-42b4-83e3-ed422d61180f	58e542b1-188a-4152-8799-2f63a14b9cb3	standard	CW	2025-10-11 03:13:35.236
af210893-e980-42df-aed9-34d7a7c75b81	58e542b1-188a-4152-8799-2f63a14b9cb3	condition	used	2025-10-11 03:13:35.236
b226b8fd-2eaf-4779-b50f-ba4bad3fec1f	cbdb7804-e0b9-4d05-aff8-4588d3a366d4	size	40	2025-10-14 03:51:21.763
99cc0837-f971-480e-899f-bdb6f40b1922	cbdb7804-e0b9-4d05-aff8-4588d3a366d4	type	HC	2025-10-14 03:51:21.763
d65623cd-a1d7-40ae-99de-d4fe3dbbe1fb	cbdb7804-e0b9-4d05-aff8-4588d3a366d4	standard	CW	2025-10-14 03:51:21.763
67421d9b-ed3d-46b3-8088-93b0610667ab	cbdb7804-e0b9-4d05-aff8-4588d3a366d4	condition	used	2025-10-14 03:51:21.763
9b7ab884-6839-4188-809e-0dfa0004e7f6	136b5be7-fff8-4c95-b746-796b3128ada4	size	40	2025-10-15 05:08:05.24
697b6d3c-4b47-46e6-87e4-0b20d7ac4d95	136b5be7-fff8-4c95-b746-796b3128ada4	type	FR	2025-10-15 05:08:05.24
73eb712c-dd58-4ed9-93ee-2709259768f3	136b5be7-fff8-4c95-b746-796b3128ada4	standard	CW	2025-10-15 05:08:05.24
9350baea-341d-49db-901c-a45af7a2e9b9	136b5be7-fff8-4c95-b746-796b3128ada4	condition	refurbished	2025-10-15 05:08:05.24
9bfcc1bb-d601-4634-94de-0783206e0f46	32e3c2f0-ce33-4a02-899c-1cf21e216c0a	size	45	2025-10-16 01:56:54.4
e29c79d9-ed28-4c12-9799-ea5c089358c2	32e3c2f0-ce33-4a02-899c-1cf21e216c0a	type	FR	2025-10-16 01:56:54.4
8124ee1c-abe7-4d77-ac4d-b6d6ffe22cdd	32e3c2f0-ce33-4a02-899c-1cf21e216c0a	standard	CW	2025-10-16 01:56:54.4
afe9106a-3af2-49c3-821f-0e4ae9938c41	32e3c2f0-ce33-4a02-899c-1cf21e216c0a	condition	used	2025-10-16 01:56:54.4
6a84af7e-1bd9-4ccc-be4c-439744455a42	00dc48ed-5625-44ad-b600-038f569da9d7	size	45	2025-10-17 04:52:28.189
e5b9cd86-b940-406c-af12-ce34c3349cf6	00dc48ed-5625-44ad-b600-038f569da9d7	type	DRY	2025-10-17 04:52:28.189
27f2203f-22ad-4d3c-9b87-9f4ae52b77de	00dc48ed-5625-44ad-b600-038f569da9d7	standard	CW	2025-10-17 04:52:28.189
4fe17b31-c9a0-451f-b460-0aa8300d3694	00dc48ed-5625-44ad-b600-038f569da9d7	condition	used	2025-10-17 04:52:28.189
905088d8-3ca5-412a-91d1-42d4cdbb8925	dce2d035-2f62-4fd3-aeaf-ada7de1e6dbe	size	20	2025-10-17 06:53:44.722
5f503593-a625-4003-8ba6-128082d3f1d9	dce2d035-2f62-4fd3-aeaf-ada7de1e6dbe	type	FR	2025-10-17 06:53:44.722
81a2fd49-7cdc-4acf-b9f4-860aaa771e45	dce2d035-2f62-4fd3-aeaf-ada7de1e6dbe	standard	WWT	2025-10-17 06:53:44.722
6a96aafe-2d33-4be9-95e5-d3ee7dc2da2f	dce2d035-2f62-4fd3-aeaf-ada7de1e6dbe	condition	used	2025-10-17 06:53:44.722
84031a72-4ff9-4f61-84ba-59161dd8f420	ab1c7335-ff85-4782-87c7-3ea188d88305	size	45	2025-10-23 03:37:42.031
682fa86f-2589-4dac-a62c-ce65f67b409c	ab1c7335-ff85-4782-87c7-3ea188d88305	type	HC	2025-10-23 03:37:42.031
ab09d446-0893-47eb-b5e3-96a853063383	ab1c7335-ff85-4782-87c7-3ea188d88305	standard	CW	2025-10-23 03:37:42.031
e3bda38a-7458-4afd-b728-9b763d7d3855	ab1c7335-ff85-4782-87c7-3ea188d88305	condition	new	2025-10-23 03:37:42.031
108b2f18-8528-4723-b35f-9079e6f870b1	6e5e38f3-7a09-4b6f-ac03-1f92b192aea8	size	40	2025-10-23 04:41:49.78
3aface48-0465-4f04-a4ec-33c33ec5f13a	6e5e38f3-7a09-4b6f-ac03-1f92b192aea8	type	FR	2025-10-23 04:41:49.78
7082a2fb-6a76-4c58-8774-f6fc36017b80	6e5e38f3-7a09-4b6f-ac03-1f92b192aea8	standard	CW	2025-10-23 04:41:49.78
63d7d2fb-fb4b-4dd0-b68d-34d315283092	6e5e38f3-7a09-4b6f-ac03-1f92b192aea8	condition	new	2025-10-23 04:41:49.78
61a4d4b2-7489-4432-8d79-f9d2ac2a3f50	61ec27c7-0b0a-4201-849c-6202ad7b3711	size	10	2025-10-27 03:27:52.109
ffc0e99f-b955-42c8-9a45-600cfba40f15	61ec27c7-0b0a-4201-849c-6202ad7b3711	type	DRY	2025-10-27 03:27:52.109
2523ebab-5401-4a18-adc6-b01574961785	61ec27c7-0b0a-4201-849c-6202ad7b3711	standard	CW	2025-10-27 03:27:52.109
13b30144-a982-4928-91f1-05314060e6b2	61ec27c7-0b0a-4201-849c-6202ad7b3711	condition	new	2025-10-27 03:27:52.109
db92640a-22c7-484d-abc5-51f376e269df	e55ae805-34c1-4ed5-93ab-8927b9b877a0	size	45	2025-10-28 03:36:49.65
582f09e6-4067-43a8-894e-ba1f3456785a	e55ae805-34c1-4ed5-93ab-8927b9b877a0	type	HC	2025-10-28 03:36:49.65
b95267e9-7297-4960-848e-556184aff0f9	e55ae805-34c1-4ed5-93ab-8927b9b877a0	standard	CW	2025-10-28 03:36:49.65
6bf69a89-3af9-4932-826a-5630b56046a6	e55ae805-34c1-4ed5-93ab-8927b9b877a0	condition	new	2025-10-28 03:36:49.65
3ba06169-e514-4008-a9a8-710e7089dd4a	d48354ab-b603-4acf-8c3d-a170274acaf8	size	10	2025-10-29 10:08:52.837
17ff90a5-2b26-4ad6-9285-55f211c2b4b6	d48354ab-b603-4acf-8c3d-a170274acaf8	type	PF	2025-10-29 10:08:52.837
358f0f2a-ed91-4200-bb02-019bc36e899b	d48354ab-b603-4acf-8c3d-a170274acaf8	standard	ASIS	2025-10-29 10:08:52.837
2adc1046-991e-4c42-b6c1-c0d887aa9798	d48354ab-b603-4acf-8c3d-a170274acaf8	condition	new	2025-10-29 10:08:52.837
5319c73e-b3e4-41c4-ac6a-8dc6f0813255	aa6bdd82-5ed5-4c6b-8c53-2ead96f510b8	size	40	2025-10-30 07:51:08.917
8feb0ae7-43ff-492f-a0a8-9bb07af609a6	aa6bdd82-5ed5-4c6b-8c53-2ead96f510b8	type	FR	2025-10-30 07:51:08.917
24277291-d5e6-4eaf-90ae-970990563523	aa6bdd82-5ed5-4c6b-8c53-2ead96f510b8	standard	CW	2025-10-30 07:51:08.917
80091c84-27ad-4b27-beeb-93296528f1fa	aa6bdd82-5ed5-4c6b-8c53-2ead96f510b8	condition	new	2025-10-30 07:51:08.917
cf37d99c-7852-46af-96ff-fd2278424cee	24f2a784-a418-4deb-8fcd-1f7631c6b5d3	size	40	2025-10-31 02:03:42.343
79ecca1c-ebc9-4b9f-bd09-e2e4181a5fea	24f2a784-a418-4deb-8fcd-1f7631c6b5d3	type	HC	2025-10-31 02:03:42.343
9a621ce2-71cd-4d95-9e6d-2fa228cc2547	24f2a784-a418-4deb-8fcd-1f7631c6b5d3	standard	CW	2025-10-31 02:03:42.343
80451c7f-8263-4fb4-b5b4-d91cc47aa4be	24f2a784-a418-4deb-8fcd-1f7631c6b5d3	condition	new	2025-10-31 02:03:42.343
5cff8d4d-6f38-46fc-a0b7-a96b26c7a01e	4988d8f6-b8e4-4298-be96-b084d5c8cd10	size	40	2025-10-31 03:49:02.394
ac0d7a0b-4c72-4a2f-9206-cef9bf88cc02	4988d8f6-b8e4-4298-be96-b084d5c8cd10	type	FR	2025-10-31 03:49:02.394
75b0f6c3-a731-46e0-80be-98b333e3874b	4988d8f6-b8e4-4298-be96-b084d5c8cd10	standard	CW	2025-10-31 03:49:02.394
b23c1700-032a-4c37-a267-94e4023979c3	4988d8f6-b8e4-4298-be96-b084d5c8cd10	condition	new	2025-10-31 03:49:02.394
\.


--
-- Data for Name: listing_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listing_media (id, listing_id, media_url, media_type, sort_order, alt_text, file_size, mime_type, created_at, updated_at, original_filename, uploaded_by) FROM stdin;
2ce4a498-b83a-45c9-b605-42930f29e7b2	32d899e2-d94a-4647-a173-b3e2095be8ba	/uploads/media/test-image.png	IMAGE	0	\N	\N	\N	2025-10-11 03:09:49.145	2025-10-11 03:09:49.144	\N	\N
5fdd36a0-a08f-4466-9b37-10563e156892	af274334-c1e6-4498-b8a6-b5c9a982ebd3	/uploads/media/test-image.png	IMAGE	0	\N	\N	\N	2025-10-11 03:09:58.021	2025-10-11 03:09:58.02	\N	\N
3ff7b325-d60e-4af9-b3d8-639b118c9225	3b42cd41-02ea-4f07-a350-c52b6154284e	/uploads/media/test-image.png	IMAGE	0	\N	\N	\N	2025-10-11 03:10:08.046	2025-10-11 03:10:08.045	\N	\N
059897fa-9583-484b-8073-edb28dbb5e91	58e542b1-188a-4152-8799-2f63a14b9cb3	/uploads/media/c55f455f-2b60-48e0-a735-ab4e5ae74794.png	IMAGE	0	\N	\N	\N	2025-10-11 03:13:35.253	2025-10-11 03:13:35.252	\N	\N
345bc7a5-8869-4efd-b51b-9312992ea563	58e542b1-188a-4152-8799-2f63a14b9cb3	/uploads/media/0052f9a5-21de-40e2-be95-9c5a0004ba39.png	IMAGE	1	\N	\N	\N	2025-10-11 03:13:35.261	2025-10-11 03:13:35.26	\N	\N
52abaede-d4c1-40d5-be94-e71de50352bf	cbdb7804-e0b9-4d05-aff8-4588d3a366d4	/uploads/media/f38bf59a-5d13-41dd-97d5-93d01c8a7478.png	IMAGE	0	\N	\N	\N	2025-10-14 03:51:21.801	2025-10-14 03:51:21.799	\N	\N
72f669ae-527f-46b1-9db6-b496d7be1b92	136b5be7-fff8-4c95-b746-796b3128ada4	/uploads/media/d168481a-a11a-4f08-92da-9eed8494e2c2.png	IMAGE	0	\N	\N	\N	2025-10-15 05:08:05.3	2025-10-15 05:08:05.298	\N	\N
18bbf5d2-0918-4895-829f-27f517a2ccb8	32e3c2f0-ce33-4a02-899c-1cf21e216c0a	/uploads/media/c61bfe4d-48f8-497c-8a3b-232cbd403610.png	IMAGE	0	\N	\N	\N	2025-10-16 01:56:54.456	2025-10-16 01:56:54.454	\N	\N
0d24d821-2e40-40ac-86d9-921da27f8b2e	00dc48ed-5625-44ad-b600-038f569da9d7	/uploads/media/8724a71f-9660-4a29-8a1c-431d81096e4c.jpg	IMAGE	0	\N	\N	\N	2025-10-17 04:52:28.258	2025-10-17 04:52:28.256	\N	\N
62fb152c-5ad8-40f7-b1ee-6ca9a50267f6	dce2d035-2f62-4fd3-aeaf-ada7de1e6dbe	/uploads/media/24638727-bef1-4fac-862d-15ff590aecea.png	IMAGE	0	\N	\N	\N	2025-10-17 06:53:44.737	2025-10-17 06:53:44.735	\N	\N
97338af3-7c7b-4b63-91b4-78cd9834ca43	95782795-f016-49dd-a923-07198b87db93	/uploads/media/f6c57db1-4487-42d4-b49a-8b08d67bbe36.png	IMAGE	0	\N	\N	\N	2025-10-20 06:30:24.368	2025-10-20 06:30:24.366	\N	\N
2bac1ed5-bac2-4ca6-8574-d0ca46cd4174	95782795-f016-49dd-a923-07198b87db93	/uploads/media/a3b4f33d-b838-4c80-8631-fcab1ea32ad3.png	IMAGE	0	\N	\N	\N	2025-10-20 06:30:28.739	2025-10-20 06:30:28.737	\N	\N
acf448d2-427e-4d40-9661-29ee2c3848de	95782795-f016-49dd-a923-07198b87db93	/uploads/media/ee2cb076-5679-4836-9c3b-b1a207e3b267.png	IMAGE	0	\N	\N	\N	2025-10-20 06:33:44.043	2025-10-20 06:33:44.042	\N	\N
59e50ba0-d0fa-452f-89b1-31cbe8f24524	ab1c7335-ff85-4782-87c7-3ea188d88305	/uploads/media/6aefda60-b9fe-4d69-8f5a-8aa6a75c7f51.jpg	IMAGE	0	\N	\N	\N	2025-10-23 03:37:42.056	2025-10-23 03:37:42.055	\N	\N
f7b53ce0-049c-4f3b-bbd4-bb9c383b83ad	ab1c7335-ff85-4782-87c7-3ea188d88305	/uploads/media/4f781764-0d59-4dd2-867a-c10249b9f911.jpg	IMAGE	1	\N	\N	\N	2025-10-23 03:37:42.069	2025-10-23 03:37:42.068	\N	\N
4e4b6872-fee3-410d-bc46-bf2e5bdbcf0a	ab1c7335-ff85-4782-87c7-3ea188d88305	/uploads/media/9c6905e5-af8c-494f-93d7-4fdf22709ad2.jpg	IMAGE	2	\N	\N	\N	2025-10-23 03:37:42.08	2025-10-23 03:37:42.079	\N	\N
89f3d4d2-6fc9-4713-a57e-a05309c0772f	ab1c7335-ff85-4782-87c7-3ea188d88305	/uploads/media/4cdb64d2-c9a8-4c86-af58-2ceec5ef2b7c.jpg	IMAGE	3	\N	\N	\N	2025-10-23 03:37:42.087	2025-10-23 03:37:42.086	\N	\N
4ad1851b-6d1e-472f-a577-da11793ae805	ab1c7335-ff85-4782-87c7-3ea188d88305	/uploads/media/93854c3c-f578-4845-bce3-6e769b86d258.jpg	IMAGE	4	\N	\N	\N	2025-10-23 03:37:42.095	2025-10-23 03:37:42.094	\N	\N
f8d69805-7418-4d42-adcd-9f1cb0861457	ab1c7335-ff85-4782-87c7-3ea188d88305	/uploads/media/58a66292-9009-4367-bb8f-3085a0ab5730.jpg	IMAGE	5	\N	\N	\N	2025-10-23 03:37:42.103	2025-10-23 03:37:42.102	\N	\N
c37ae3bd-64d2-456d-b0e1-a4d58e0d9647	6e5e38f3-7a09-4b6f-ac03-1f92b192aea8	/uploads/media/3422bd21-0c00-4155-a161-8f5cd484b221.jpg	IMAGE	0	\N	\N	\N	2025-10-23 04:41:49.819	2025-10-23 04:41:49.817	\N	\N
4a49f469-4013-424d-af52-b0382fbd6301	6e5e38f3-7a09-4b6f-ac03-1f92b192aea8	/uploads/media/acadf29e-0ad8-4c1e-955a-b99d400494fd.jpg	IMAGE	1	\N	\N	\N	2025-10-23 04:41:49.829	2025-10-23 04:41:49.828	\N	\N
d2a96723-7ec1-4d9c-aab6-32c68558428b	6e5e38f3-7a09-4b6f-ac03-1f92b192aea8	/uploads/media/4a8a232e-260f-48b9-b564-c14b8e12303b.jpg	IMAGE	2	\N	\N	\N	2025-10-23 04:41:49.837	2025-10-23 04:41:49.836	\N	\N
f27dab8b-917c-449d-9386-0833daefe7f6	61ec27c7-0b0a-4201-849c-6202ad7b3711	/uploads/media/32ce9590-9c05-431e-a61e-2704b91bb1c4.jpg	IMAGE	0	\N	\N	\N	2025-10-27 03:27:52.147	2025-10-27 03:27:52.146	\N	\N
9eccad40-611d-4b81-956d-7faf3117d8eb	e55ae805-34c1-4ed5-93ab-8927b9b877a0	/uploads/media/0ac274e2-6334-4ccf-bb1b-ab1bdfd3050b.jpg	IMAGE	0	\N	\N	\N	2025-10-28 03:36:49.713	2025-10-28 03:36:49.712	\N	\N
48b6a1c5-d62e-4542-a1dd-83eda905061d	e55ae805-34c1-4ed5-93ab-8927b9b877a0	/uploads/media/2d551eb7-e75d-4224-9f8a-e5c24519c8a5.jpg	IMAGE	1	\N	\N	\N	2025-10-28 03:36:49.713	2025-10-28 03:36:49.712	\N	\N
49c2e4d0-c49f-4163-8918-4b6f0b605f2b	d48354ab-b603-4acf-8c3d-a170274acaf8	/uploads/media/de8ad86e-dfb7-471d-a9f4-21de4ea134b0.jpg	IMAGE	0	\N	\N	\N	2025-10-29 10:08:52.905	2025-10-29 10:08:52.903	\N	\N
7eb69326-406c-44a1-9464-e23b87897365	d48354ab-b603-4acf-8c3d-a170274acaf8	/uploads/media/10011cbf-1dd0-416a-a0c7-13d24e1a7d05.jpg	IMAGE	1	\N	\N	\N	2025-10-29 10:08:52.906	2025-10-29 10:08:52.905	\N	\N
20e784de-a114-41da-a7ef-f9d5f083d158	aa6bdd82-5ed5-4c6b-8c53-2ead96f510b8	/uploads/media/4a68e51b-ba2e-4de3-b6bd-c5e355fc4553.jpg	IMAGE	0	\N	\N	\N	2025-10-30 07:51:09.304	2025-10-30 07:51:09.303	\N	\N
7f03e59b-be5a-4323-b053-5049969f47c5	aa6bdd82-5ed5-4c6b-8c53-2ead96f510b8	/uploads/media/458a5468-0ab7-4a8e-856d-c4c38e03b934.jpg	IMAGE	1	\N	\N	\N	2025-10-30 07:51:09.309	2025-10-30 07:51:09.306	\N	\N
415827a3-0ec0-47bc-9826-a7f205a99323	24f2a784-a418-4deb-8fcd-1f7631c6b5d3	/uploads/media/44f700a4-d0b6-4d39-82cf-d68867505d96.jpg	IMAGE	0	\N	\N	\N	2025-10-31 02:03:42.396	2025-10-31 02:03:42.395	\N	\N
924e1ae3-f71e-4fdb-9660-3e96e86aa47f	4988d8f6-b8e4-4298-be96-b084d5c8cd10	/uploads/media/1d5ca11a-d560-486a-ac9b-a19f98568623.jpg	IMAGE	0	\N	\N	\N	2025-10-31 03:49:02.414	2025-10-31 03:49:02.412	\N	\N
dcd04ded-bd53-4995-a0e4-b3db60622c90	4988d8f6-b8e4-4298-be96-b084d5c8cd10	/uploads/media/496057c2-3c3f-4339-9125-653d9b67725d.jpg	IMAGE	1	\N	\N	\N	2025-10-31 03:49:02.415	2025-10-31 03:49:02.413	\N	\N
ec4bc79e-d4b5-4295-866f-7a78e1fce2bb	4988d8f6-b8e4-4298-be96-b084d5c8cd10	/uploads/media/9c9b5ad4-c0c4-49b4-acc9-de46578f225e.jpg	IMAGE	2	\N	\N	\N	2025-10-31 03:49:02.418	2025-10-31 03:49:02.416	\N	\N
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listings (id, container_id, seller_user_id, org_id, deal_type, price_currency, price_amount, rental_unit, location_depot_id, status, title, description, features, specifications, view_count, favorite_count, published_at, expires_at, created_at, updated_at, deleted_at, rejection_reason, admin_reviewed_by, admin_reviewed_at, total_quantity, available_quantity, rented_quantity, reserved_quantity, maintenance_quantity, min_rental_duration, max_rental_duration, deposit_required, deposit_amount, deposit_currency, late_return_fee_amount, late_return_fee_unit, earliest_available_date, latest_return_date, auto_renewal_enabled, renewal_notice_days, renewal_price_adjustment, last_rented_at, total_rental_count) FROM stdin;
4599f3fd-10b7-4425-b551-7ccf0ed10718	\N	user-seller	\N	SALE	VND	75000000.000000000000000000000000000000	\N	5d2dfc1e-77d8-4fd8-9e0b-d7920c3d4d98	PENDING_REVIEW	Test Container 20ft	Container 20ft chat luong cao	\N	\N	0	0	\N	\N	2025-10-09 10:07:32.491	2025-10-09 10:07:32.489	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
73e8427c-f891-423b-87fd-fe465b5f30a4	\N	user-seller	\N	SALE	VND	150000000.000000000000000000000000000000	\N	3feea6b3-d262-4121-ab34-b5f7a2b0e393	PENDING_REVIEW	Bán Container	Cần bán số lượng lớn Container 	\N	\N	0	0	\N	\N	2025-10-09 10:10:22.307	2025-10-09 10:10:22.305	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
59d8a4d4-ec97-4762-ac6d-bd77fce57efa	\N	user-seller	\N	SALE	VND	150000000.000000000000000000000000000000	\N	3feea6b3-d262-4121-ab34-b5f7a2b0e393	PENDING_REVIEW	Bán Container	Cần bán số lượng lớn Container 	\N	\N	0	0	\N	\N	2025-10-09 10:10:23.533	2025-10-09 10:10:23.532	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
6dbd4aa5-946b-4212-9be4-c4cc8dba3271	\N	user-seller	\N	SALE	VND	200000000.000000000000000000000000000000	\N	5d2dfc1e-77d8-4fd8-9e0b-d7920c3d4d98	PENDING_REVIEW	Cần bán Container	chúng tôi cần bán số lượng lớn Container 	\N	\N	0	0	\N	\N	2025-10-09 10:18:11.097	2025-10-09 10:18:11.095	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
d0c5c376-acd1-4f91-b7d4-2b82f8f7a1b7	\N	user-seller	\N	SALE	VND	150000000.000000000000000000000000000000	\N	3feea6b3-d262-4121-ab34-b5f7a2b0e393	ACTIVE	Bán Container	Cần bán số lượng lớn container	\N	\N	0	0	2025-10-10 03:19:41.052	\N	2025-10-09 10:32:23.32	2025-10-10 03:19:41.052	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
2fb39b1f-14ee-4559-8a20-72cbd00f4fc2	\N	user-seller	\N	SALE	VND	200000000.000000000000000000000000000000	\N	5d2dfc1e-77d8-4fd8-9e0b-d7920c3d4d98	ACTIVE	Cần bán Container	chúng tôi cần bán số lượng lớn Container 	\N	\N	0	0	2025-10-10 03:50:14.044	\N	2025-10-09 10:18:13.333	2025-10-10 03:50:14.044	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
92bbb16f-2bd7-42d1-aa3c-0f130a7d2ead	\N	user-seller	\N	SALE	VND	200000000.000000000000000000000000000000	\N	6edf4c7f-c062-43a8-970e-605d5b4aee9a	PENDING_REVIEW	Cần bán 20 Container mới 100%	Container mới 100% 	\N	\N	0	0	\N	\N	2025-10-10 04:03:16.078	2025-10-10 04:03:16.076	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
da4cb168-ce2a-43f2-9e73-96f98abe71d2	\N	user-seller	\N	RENTAL	VND	100000000.000000000000000000000000000000	\N	8059611a-7462-4cd0-8ea0-495050c93f65	PENDING_REVIEW	Container sàn phẳng 45ft Đạt chuẩn vận chuyển - Thuê ngắn hạn	trtewr	\N	\N	0	0	\N	\N	2025-10-10 06:35:13.661	2025-10-10 06:35:13.659	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
75294c88-f97a-44ae-8f35-308e41fc93b5	\N	user-seller	\N	SALE	VND	250000000.000000000000000000000000000000	\N	8059611a-7462-4cd0-8ea0-495050c93f65	PENDING_REVIEW	Bán Container	Chúng tôi cần bán số lượng lớn container mới 100%	\N	\N	0	0	\N	\N	2025-10-10 09:29:46.69	2025-10-10 09:29:46.689	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
49ee0f29-1330-4c94-a2d2-4bcf08ef157b	\N	user-seller	\N	SALE	VND	200000000.000000000000000000000000000000	\N	6edf4c7f-c062-43a8-970e-605d5b4aee9a	PENDING_REVIEW	Container 20ft FR - Đạt chuẩn vận chuyển	zxcvxvcxvcvccfvcvcvc	\N	\N	0	0	\N	\N	2025-10-10 09:53:54.413	2025-10-10 09:53:54.412	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
0f679513-741b-43c8-8881-1d104bdbd354	\N	user-seller	\N	SALE	VND	60970900.000000000000000000000000000000	\N	8059611a-7462-4cd0-8ea0-495050c93f65	PENDING_REVIEW	Container 40ft FR - Tiêu chuẩn IICL	bmnbmnbmbnmbnmvbn cvbc bxcvxdfzd	\N	\N	0	0	\N	\N	2025-10-10 09:55:32.556	2025-10-10 09:55:32.554	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
3a66ef48-dbd4-461b-9beb-f7c3d52b0ed6	\N	user-seller	\N	SALE	VND	5000000000.000000000000000000000000000000	\N	6edf4c7f-c062-43a8-970e-605d5b4aee9a	PENDING_REVIEW	Container 10ft HC - Tiêu chuẩn IICL	cxvbcbgcvhfghfxvxcgdfg	\N	\N	0	0	\N	\N	2025-10-10 10:04:53.256	2025-10-10 10:04:53.255	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
ac051cf9-a7ca-49c0-82c3-e726fb8104b3	\N	user-seller	\N	SALE	VND	4000000000.000000000000000000000000000000	\N	6edf4c7f-c062-43a8-970e-605d5b4aee9a	ACTIVE	Container 20ft HC - Tiêu chuẩn IICL	sdzgxcvvcvcvcvc	\N	\N	0	0	2025-10-10 10:12:05.957	\N	2025-10-10 10:11:20.506	2025-10-10 10:12:05.957	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
c2ba5e55-3767-4821-a082-e8929a7524da	\N	user-seller	\N	SALE	VND	24000000.000000000000000000000000000000	\N	8059611a-7462-4cd0-8ea0-495050c93f65	PENDING_REVIEW	Container 40ft FR - Kín gió và nước	sdvccxvc xdsfgdfgwerfdszx dgdfgasdcAsxaxd	\N	\N	0	0	\N	\N	2025-10-11 02:54:12.829	2025-10-11 02:54:12.828	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
8aeff3d2-042c-43af-b449-7c6d1f567625	\N	user-seller	\N	SALE	VND	24000000.000000000000000000000000000000	\N	8059611a-7462-4cd0-8ea0-495050c93f65	PENDING_REVIEW	Container 40ft FR - Kín gió và nước	sdvccxvc xdsfgdfgwerfdszx dgdfgasdcAsxaxd	\N	\N	0	0	\N	\N	2025-10-11 02:54:22.397	2025-10-11 02:54:22.396	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
4ce52ae4-d9c4-443d-8f4c-ba77be285b58	\N	640a4460-4cea-4edb-b5dc-32b8cad6360c	\N	SALE	USD	10000.000000000000000000000000000000	\N	762748da-aa8e-4efd-b542-6f99c6f8cbb5	PENDING_REVIEW	Test Container	This is a test container listing for debugging	\N	\N	0	0	\N	\N	2025-10-11 03:05:59.324	2025-10-11 03:05:59.322	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
c68c426a-a94c-472f-b7f6-55614df4486e	\N	640a4460-4cea-4edb-b5dc-32b8cad6360c	\N	SALE	USD	10000.000000000000000000000000000000	\N	762748da-aa8e-4efd-b542-6f99c6f8cbb5	PENDING_REVIEW	Test Container	This is a test container listing for debugging	\N	\N	0	0	\N	\N	2025-10-11 03:07:20.89	2025-10-11 03:07:20.888	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
1b1051fa-a69c-42f3-929d-39e7d7099b2a	\N	640a4460-4cea-4edb-b5dc-32b8cad6360c	\N	SALE	USD	10000.000000000000000000000000000000	\N	762748da-aa8e-4efd-b542-6f99c6f8cbb5	PENDING_REVIEW	Test Container	This is a test container listing for debugging	\N	\N	0	0	\N	\N	2025-10-11 03:07:29.93	2025-10-11 03:07:29.928	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
67a0ad73-11a6-47e2-9cf5-1da8ea1e4e2f	\N	640a4460-4cea-4edb-b5dc-32b8cad6360c	\N	SALE	USD	10000.000000000000000000000000000000	\N	762748da-aa8e-4efd-b542-6f99c6f8cbb5	PENDING_REVIEW	Test Container	This is a test container listing for debugging	\N	\N	0	0	\N	\N	2025-10-11 03:07:47.41	2025-10-11 03:07:47.408	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
324e36cd-b6dc-4837-9fb6-498353b7de8d	\N	640a4460-4cea-4edb-b5dc-32b8cad6360c	\N	SALE	USD	10000.000000000000000000000000000000	\N	762748da-aa8e-4efd-b542-6f99c6f8cbb5	PENDING_REVIEW	Test Container	This is a test container listing for debugging	\N	\N	0	0	\N	\N	2025-10-11 03:08:00.325	2025-10-11 03:08:00.324	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
4947d637-4ceb-48c0-b279-4e90459bd1e1	\N	640a4460-4cea-4edb-b5dc-32b8cad6360c	\N	SALE	USD	10000.000000000000000000000000000000	\N	762748da-aa8e-4efd-b542-6f99c6f8cbb5	PENDING_REVIEW	Test Container	This is a test container listing for debugging	\N	\N	0	0	\N	\N	2025-10-11 03:08:27.874	2025-10-11 03:08:27.872	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
fa2ffd5e-5c87-4c36-a114-a0ddd53f87a7	\N	640a4460-4cea-4edb-b5dc-32b8cad6360c	\N	SALE	USD	10000.000000000000000000000000000000	\N	762748da-aa8e-4efd-b542-6f99c6f8cbb5	PENDING_REVIEW	Test Container	This is a test container listing for debugging	\N	\N	0	0	\N	\N	2025-10-11 03:08:41.833	2025-10-11 03:08:41.832	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
32d899e2-d94a-4647-a173-b3e2095be8ba	\N	640a4460-4cea-4edb-b5dc-32b8cad6360c	\N	SALE	USD	10000.000000000000000000000000000000	\N	762748da-aa8e-4efd-b542-6f99c6f8cbb5	PENDING_REVIEW	Test Container	This is a test container listing for debugging	\N	\N	0	0	\N	\N	2025-10-11 03:09:49.132	2025-10-11 03:09:49.131	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
af274334-c1e6-4498-b8a6-b5c9a982ebd3	\N	640a4460-4cea-4edb-b5dc-32b8cad6360c	\N	SALE	USD	10000.000000000000000000000000000000	\N	762748da-aa8e-4efd-b542-6f99c6f8cbb5	PENDING_REVIEW	Test Container	This is a test container listing for debugging	\N	\N	0	0	\N	\N	2025-10-11 03:09:58.009	2025-10-11 03:09:58.008	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
3b42cd41-02ea-4f07-a350-c52b6154284e	\N	640a4460-4cea-4edb-b5dc-32b8cad6360c	\N	SALE	USD	10000.000000000000000000000000000000	\N	762748da-aa8e-4efd-b542-6f99c6f8cbb5	PENDING_REVIEW	Test Container	This is a test container listing for debugging	\N	\N	0	0	\N	\N	2025-10-11 03:10:08.034	2025-10-11 03:10:08.033	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
58e542b1-188a-4152-8799-2f63a14b9cb3	\N	user-seller	\N	SALE	VND	500000000.000000000000000000000000000000	\N	54281c5f-b0ee-4d7d-a18d-a2ff6dd48398	ACTIVE	Container 45ft FR - Đạt chuẩn vận chuyển	Bán Container đã qua sử dụng 	\N	\N	0	0	2025-10-11 03:14:32.019	\N	2025-10-11 03:13:35.23	2025-10-11 03:14:32.019	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
8db66227-c31c-42d3-9e75-b77cc6809495	\N	user-seller	\N	SALE	VND	1500000000.000000000000000000000000000000	\N	5d2dfc1e-77d8-4fd8-9e0b-d7920c3d4d98	ACTIVE	Container 45ft DRY - Đạt chuẩn vận chuyển	Chúng tôi cần bán container  Nguồn: Depots API /api/v1/depots\nHiển thị: Name + Address + Available Slots\nValidation: Phải chọn depot có available slots > 0	\N	\N	0	0	2025-10-14 03:36:48.07	\N	2025-10-10 09:40:38.238	2025-10-14 03:36:48.07	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
cbdb7804-e0b9-4d05-aff8-4588d3a366d4	\N	user-seller	\N	SALE	VND	20000000.000000000000000000000000000000	\N	3feea6b3-d262-4121-ab34-b5f7a2b0e393	ACTIVE	Container 40ft HC - Đạt chuẩn vận chuyển	Cần bán số lượng lớn Container đã qua sử dụng	\N	\N	0	0	2025-10-14 03:52:19.508	\N	2025-10-14 03:51:21.752	2025-10-14 03:52:19.508	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
28e90ebb-31fe-4710-ad2f-d8fd52329ee6	\N	user-seller	\N	SALE	VND	10000000.000000000000000000000000000000	\N	5d2dfc1e-77d8-4fd8-9e0b-d7920c3d4d98	PENDING_REVIEW	Test Container Listing	Simple test listing	\N	\N	0	0	\N	\N	2025-10-14 04:31:05.242	2025-10-14 04:31:05.241	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
a7f485f5-aff9-40c7-a7dc-cac6c84962f6	\N	user-seller	\N	SALE	VND	10000000.000000000000000000000000000000	\N	5d2dfc1e-77d8-4fd8-9e0b-d7920c3d4d98	ACTIVE	Test Container Listing	Simple test listing	\N	\N	0	0	2025-10-16 01:55:17.423	\N	2025-10-14 04:32:06.012	2025-10-16 01:55:17.423	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
95782795-f016-49dd-a923-07198b87db93	\N	user-seller	\N	SALE	VND	100000000.000000000000000000000000000000	\N	5d2dfc1e-77d8-4fd8-9e0b-d7920c3d4d98	PENDING_REVIEW	Container Listing Bán	Bán số lượng 200 container mới 100%	\N	\N	0	0	\N	\N	2025-10-14 04:31:28.648	2025-10-20 06:33:43.896	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
2ae6fd5a-cef8-4baf-99f5-b7eb23e69bf0	\N	user-seller	\N	SALE	VND	10000000.000000000000000000000000000000	\N	5d2dfc1e-77d8-4fd8-9e0b-d7920c3d4d98	ACTIVE	Test Container Listing	Simple test listing	\N	\N	0	0	\N	\N	2025-10-14 04:32:32.767	2025-10-14 04:32:33.063	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
136b5be7-fff8-4c95-b746-796b3128ada4	\N	user-seller	\N	SALE	VND	25000000.000000000000000000000000000000	\N	3feea6b3-d262-4121-ab34-b5f7a2b0e393	ACTIVE	Container 40ft FR - Đạt chuẩn vận chuyển	Chúng tôi cần bán số lượng Container mới Tân trang \n	\N	\N	0	0	2025-10-15 05:08:35.263	\N	2025-10-15 05:08:05.171	2025-10-15 05:08:35.263	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
32e3c2f0-ce33-4a02-899c-1cf21e216c0a	\N	user-seller	\N	SALE	VND	350000000.000000000000000000000000000000	\N	3feea6b3-d262-4121-ab34-b5f7a2b0e393	ACTIVE	Container 45ft FR - Đạt chuẩn vận chuyển	Cần bán số lượng lớn container đã qua sử dụng	\N	\N	0	0	2025-10-16 01:57:12.185	\N	2025-10-16 01:56:54.259	2025-10-16 01:57:12.185	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
00dc48ed-5625-44ad-b600-038f569da9d7	\N	user-seller	\N	SALE	VND	35000000.000000000000000000000000000000	\N	6edf4c7f-c062-43a8-970e-605d5b4aee9a	ACTIVE	Container 45ft DRY - Đạt chuẩn vận chuyển	Cần bán 100 Container đã qua sử dụng 	\N	\N	0	0	2025-10-17 04:55:05.974	\N	2025-10-17 04:52:28.162	2025-10-17 04:55:05.974	\N	\N	user-admin	2025-10-17 04:55:05.974	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
dce2d035-2f62-4fd3-aeaf-ada7de1e6dbe	\N	user-seller	\N	RENTAL	VND	20000000.000000000000000000000000000000	\N	3feea6b3-d262-4121-ab34-b5f7a2b0e393	ACTIVE	Container Container sàn phẳng 20 feet - Kín gió và nước	bán 200 Container đã qua sử dụng 	\N	\N	0	0	2025-10-17 08:29:52.13	\N	2025-10-17 06:53:44.713	2025-10-17 08:29:52.13	\N	\N	user-admin	2025-10-17 08:29:52.13	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
ab1c7335-ff85-4782-87c7-3ea188d88305	\N	user-seller	\N	SALE	VND	250000000.000000000000000000000000000000	\N	3feea6b3-d262-4121-ab34-b5f7a2b0e393	ACTIVE	Bán Container mới 100%	Chúng tôi cần bán 200 Container mới 100% đúng tiêu chuẩn để đóng hàng 	\N	\N	0	0	2025-10-23 04:01:03.287	\N	2025-10-23 03:37:42.023	2025-10-23 04:01:03.286	\N	\N	user-admin	2025-10-23 04:01:03.286	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
6e5e38f3-7a09-4b6f-ac03-1f92b192aea8	\N	user-seller	\N	SALE	VND	320000000.000000000000000000000000000000	\N	6edf4c7f-c062-43a8-970e-605d5b4aee9a	ACTIVE	Container mới 100% cần bán	Công ty chúng tôi cần bán số lượng lớn Container mới 	\N	\N	0	0	2025-10-23 04:43:06.841	\N	2025-10-23 04:41:49.771	2025-10-23 04:43:06.841	\N	\N	user-admin	2025-10-23 04:43:06.841	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
61ec27c7-0b0a-4201-849c-6202ad7b3711	\N	user-seller	\N	SALE	VND	70000000.000000000000000000000000000000	\N	6edf4c7f-c062-43a8-970e-605d5b4aee9a	PENDING_REVIEW	Container Container khô 10 feet - Đạt chuẩn vận chuyển	Container Container khô kích thước 10 feet với tiêu chuẩn chất lượng Đạt chuẩn vận chuyển. Tình trạng container: Mới. Loại giao dịch: Bán. Giao dịch bán container	\N	\N	0	0	\N	\N	2025-10-27 03:27:52.055	2025-10-27 03:27:52.049	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
68ce27ac-edb2-4a97-afbb-aa32c4cb6da7	\N	user-buyer	\N	SALE	VND	15000000.000000000000000000000000000000	\N	3feea6b3-d262-4121-ab34-b5f7a2b0e393	PENDING_REVIEW	Container ban boi Buyer	\N	\N	\N	0	0	\N	\N	2025-10-27 07:53:16.962	2025-10-27 07:53:16.96	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
f511425a-ce4d-4881-963d-29a99058d6cf	\N	user-buyer	\N	SALE	VND	15000000.000000000000000000000000000000	\N	3feea6b3-d262-4121-ab34-b5f7a2b0e393	PENDING_REVIEW	Container Buyer Test	\N	\N	\N	0	0	\N	\N	2025-10-27 07:53:29.314	2025-10-27 07:53:29.313	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
e55ae805-34c1-4ed5-93ab-8927b9b877a0	\N	user-buyer	\N	SALE	VND	45000000.000000000000000000000000000000	\N	5d2dfc1e-77d8-4fd8-9e0b-d7920c3d4d98	ACTIVE	Buyer cần bán Container	Buyer  chúng tôi cần bán sô lượng container 	\N	\N	0	0	2025-10-28 03:37:39.229	\N	2025-10-28 03:36:49.643	2025-10-28 03:37:39.229	\N	\N	user-admin	2025-10-28 03:37:39.229	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
d48354ab-b603-4acf-8c3d-a170274acaf8	\N	user-buyer	\N	SALE	VND	1000000000.000000000000000000000000000000	\N	762748da-aa8e-4efd-b542-6f99c6f8cbb5	PENDING_REVIEW	fbgdfgfdgdfgdfgdfgdfg	fdgdfgdfgdfgdf	\N	\N	0	0	\N	\N	2025-10-29 10:08:52.765	2025-10-29 10:08:52.763	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
aa6bdd82-5ed5-4c6b-8c53-2ead96f510b8	\N	user-seller	\N	RENTAL	VND	250000000.000000000000000000000000000000	MONTH	6edf4c7f-c062-43a8-970e-605d5b4aee9a	PENDING_REVIEW	Container Container sàn phẳng 40 feet - Đạt chuẩn vận chuyển	Container Container sàn phẳng kích thước 40 feet với tiêu chuẩn chất lượng Đạt chuẩn vận chuyển. Tình trạng container: Mới. Loại giao dịch: Thuê ngắn hạn. Giao dịch thuê container ngắn hạn	\N	\N	0	0	\N	\N	2025-10-30 07:51:08.792	2025-10-30 07:51:08.788	\N	\N	\N	\N	1000	1000	0	0	0	4	23	t	1000000000.00	VND	20000000.00	PER_WEEK	2025-11-05 00:00:00	2025-11-20 00:00:00	t	7	0.00	\N	0
24f2a784-a418-4deb-8fcd-1f7631c6b5d3	\N	user-seller	\N	SALE	VND	56000000.000000000000000000000000000000	\N	6edf4c7f-c062-43a8-970e-605d5b4aee9a	PENDING_REVIEW	Container Container cao 40 feet - Đạt chuẩn vận chuyển	Container Container cao kích thước 40 feet với tiêu chuẩn chất lượng Đạt chuẩn vận chuyển. Tình trạng container: Mới. Loại giao dịch: Bán. Giao dịch bán container	\N	\N	0	0	\N	\N	2025-10-31 02:03:42.262	2025-10-31 02:03:42.247	\N	\N	\N	\N	1	1	0	0	0	\N	\N	f	\N	\N	\N	\N	\N	\N	f	7	0.00	\N	0
4988d8f6-b8e4-4298-be96-b084d5c8cd10	\N	user-seller	\N	RENTAL	VND	20000000.000000000000000000000000000000	MONTH	6edf4c7f-c062-43a8-970e-605d5b4aee9a	ACTIVE	Container Container sàn phẳng 40 feet - Đạt chuẩn vận chuyển	Container Container sàn phẳng kích thước 40 feet với tiêu chuẩn chất lượng Đạt chuẩn vận chuyển. Tình trạng container: Mới. Loại giao dịch: Thuê ngắn hạn. Giao dịch thuê container ngắn hạn	\N	\N	0	0	\N	\N	2025-10-31 03:49:02.383	2025-10-31 04:12:21.644	\N	\N	user-admin	2025-10-31 04:12:21.644	200	200	0	0	0	5	35	t	200000000.00	VND	10000000.00	PER_WEEK	2025-11-07 00:00:00	2025-11-26 00:00:00	t	7	0.00	\N	0
\.


--
-- Data for Name: marketplace_policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketplace_policies (id, policy_code, name, content_md, effective_from, effective_to, version, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: md_adjust_reasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_adjust_reasons (id, code, name, description, created_at, updated_at) FROM stdin;
022d94b2-e0f7-4f14-bdd5-182d98c7cceb	STOCK_COUNT	Kiểm kê tồn kho	Điều chỉnh sau kiểm kê	2025-10-09 07:51:30.498	2025-10-09 07:51:30.496
0b5e5767-1e65-40f4-aa9d-f929cbfc7c72	DAMAGE	Hư hỏng	Container bị hư hỏng	2025-10-09 07:51:30.498	2025-10-09 07:51:30.496
a2a34202-a249-40bb-9c4a-8e9e118c4a47	LOST	Thất lạc	Container bị thất lạc	2025-10-09 07:51:30.498	2025-10-09 07:51:30.496
116d304c-3243-4aa5-bc93-629978a049b7	FOUND	Tìm thấy	Tìm thấy container thất lạc	2025-10-09 07:51:30.498	2025-10-09 07:51:30.496
9dbc889a-46e9-4670-b62c-8ba4b2c83acc	REPAIR_COMPLETE	Hoàn thành sửa chữa	Container sửa chữa xong	2025-10-09 07:51:30.498	2025-10-09 07:51:30.496
29cf4b68-e020-4a04-945c-998a87bcff0c	SYSTEM_ERROR	Lỗi hệ thống	Điều chỉnh do lỗi hệ thống	2025-10-09 07:51:30.498	2025-10-09 07:51:30.496
\.


--
-- Data for Name: md_business_hours_policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_business_hours_policies (id, code, name, description, created_at, updated_at) FROM stdin;
5467cfc6-181c-4f8f-8210-04b5e14051fe	STANDARD	Giờ hành chính	8:00-17:00, Thứ 2-6	2025-10-09 07:51:30.504	2025-10-09 07:51:30.502
0b554475-ce23-4c1d-a895-d8f28aa6e0ff	EXTENDED	Giờ mở rộng	6:00-22:00, Thứ 2-7	2025-10-09 07:51:30.504	2025-10-09 07:51:30.502
c05875a9-cf12-4d4c-8f6a-118e5d56e003	FULL_TIME	24/7	Hoạt động 24/7	2025-10-09 07:51:30.504	2025-10-09 07:51:30.502
437fde2d-0627-4624-baf6-20a02808ba87	HALF_DAY_SAT	Nửa ngày thứ 7	8:00-12:00 thứ 7	2025-10-09 07:51:30.504	2025-10-09 07:51:30.502
a76bf324-a9e6-4789-be88-e9c6068041a5	NIGHT_SHIFT	Ca đêm	18:00-6:00	2025-10-09 07:51:30.504	2025-10-09 07:51:30.502
\.


--
-- Data for Name: md_cancel_reasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_cancel_reasons (id, code, name, description, created_at, updated_at) FROM stdin;
ed6dd0c0-8caf-412e-881e-7501a1773fc4	CUSTOMER_REQUEST	Yêu cầu khách hàng	Khách hàng yêu cầu hủy	2025-10-09 07:51:30.509	2025-10-09 07:51:30.507
def98b4d-3481-4b99-aed8-2d4ed9f11d5c	PAYMENT_FAILED	Thanh toán thất bại	Không thể thanh toán	2025-10-09 07:51:30.509	2025-10-09 07:51:30.507
7dbb5641-873a-4f7d-8de0-60c78c79686d	OUT_OF_STOCK	Hết hàng	Container không còn	2025-10-09 07:51:30.509	2025-10-09 07:51:30.507
2c5532bd-251a-456a-ab91-0fc678c7f708	QUALITY_ISSUE	Vấn đề chất lượng	Container không đạt yêu cầu	2025-10-09 07:51:30.509	2025-10-09 07:51:30.507
63af4853-6eca-41e9-9760-06a202306ecc	FORCE_MAJEURE	Bất khả kháng	Thiên tai, dịch bệnh	2025-10-09 07:51:30.509	2025-10-09 07:51:30.507
f66673bb-e936-48d8-ad74-aff5d82354e5	SYSTEM_ERROR	Lỗi hệ thống	Lỗi kỹ thuật hệ thống	2025-10-09 07:51:30.509	2025-10-09 07:51:30.507
\.


--
-- Data for Name: md_cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_cities (id, province_id, code, name, name_en, created_at, updated_at) FROM stdin;
city-hcm	province-sg	HCM	TP. Hồ Chí Minh	Ho Chi Minh City	2025-10-09 07:25:18.176	2025-10-09 07:25:18.175
city-hn	province-hn	HN	Hà Nội	Hanoi	2025-10-09 07:25:18.18	2025-10-09 07:25:18.178
city-dn	province-dn	DN	Đà Nẵng	Da Nang	2025-10-09 07:25:18.181	2025-10-09 07:25:18.179
city-hp	province-hp	HP	Hải Phòng	Hai Phong	2025-10-09 07:25:18.182	2025-10-09 07:25:18.181
city-ct	province-ct	CT	Cần Thơ	Can Tho	2025-10-09 07:25:18.183	2025-10-09 07:25:18.182
\.


--
-- Data for Name: md_commission_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_commission_codes (id, code, name, description, created_at, updated_at) FROM stdin;
f417a4af-a9fe-424d-9a81-f6a644f5fb2f	TRANSACTION	Hoa hồng giao dịch	Hoa hồng trên mỗi giao dịch	2025-10-09 07:51:30.516	2025-10-09 07:51:30.514
bcb84355-7052-4138-91b0-41aee6289883	LISTING	Phí đăng tin	Phí cho việc đăng tin	2025-10-09 07:51:30.516	2025-10-09 07:51:30.514
70a3917b-1ab1-4624-8147-d15a9b0b6c97	MEMBERSHIP	Phí thành viên	Phí thành viên hàng tháng	2025-10-09 07:51:30.516	2025-10-09 07:51:30.514
b5d145b9-0298-43cb-8539-23f4c381bb0b	PREMIUM	Phí premium	Phí dịch vụ cao cấp	2025-10-09 07:51:30.516	2025-10-09 07:51:30.514
e026c610-f7d8-4904-bab3-47201b5720bc	INSPECTION	Phí giám định	Phí dịch vụ giám định	2025-10-09 07:51:30.516	2025-10-09 07:51:30.514
0a9b6fbb-cc28-40c1-ba2b-10f3fe84c4d1	DELIVERY	Phí vận chuyển	Phí dịch vụ vận chuyển	2025-10-09 07:51:30.516	2025-10-09 07:51:30.514
\.


--
-- Data for Name: md_container_sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_container_sizes (id, size_ft, name, description, created_at, updated_at) FROM stdin;
size-10	10	Container 10 feet	10 feet container	2025-10-09 07:25:18.185	2025-10-09 07:25:18.184
size-20	20	Container 20 feet	20 feet container	2025-10-09 07:25:18.188	2025-10-09 07:25:18.187
size-40	40	Container 40 feet	40 feet container	2025-10-09 07:25:18.189	2025-10-09 07:25:18.188
size-45	45	Container 45 feet	45 feet container	2025-10-09 07:25:18.191	2025-10-09 07:25:18.189
\.


--
-- Data for Name: md_container_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_container_types (id, code, name, description, created_at, updated_at) FROM stdin;
type-rf	RF	Refrigerated	Refrigerated container	2025-10-09 07:25:18.196	2025-10-09 07:25:18.195
type-vh	VH	Ventilated	Ventilated container	2025-10-09 07:25:18.2	2025-10-09 07:25:18.198
type-tk	TK	Container bồn	Tank container	2025-10-09 07:25:18.198	2025-10-09 07:25:18.197
type-pf	PF	Container sàn	Platform container	2025-10-09 07:25:18.199	2025-10-09 07:25:18.198
type-dry	DRY	Container khô	Container khô tiêu chuẩn cho hàng hóa thông thường	2025-10-09 07:25:18.192	2025-10-09 07:41:30.795
type-ot	OT	Container nóc mở	Container có thể mở nóc để vận chuyển hàng cao	2025-10-09 07:25:18.197	2025-10-09 07:41:30.8
type-fr	FR	Container sàn phẳng	Container có sàn phẳng để vận chuyển hàng nặng	2025-10-09 07:25:18.198	2025-10-09 07:41:30.801
type-hc	HC	Container cao	Container có chiều cao tăng cường (9'6")	2025-10-09 07:25:18.195	2025-10-09 07:41:30.803
\.


--
-- Data for Name: md_countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_countries (id, code, name, name_en, created_at, updated_at) FROM stdin;
country-vn	VN	Việt Nam	Vietnam	2025-10-09 07:25:18.14	2025-10-09 07:25:17.964
country-us	US	Hoa Kỳ	United States	2025-10-09 07:25:18.145	2025-10-09 07:25:18.143
country-cn	CN	Trung Quốc	China	2025-10-09 07:25:18.146	2025-10-09 07:25:18.145
country-jp	JP	Nhật Bản	Japan	2025-10-09 07:25:18.147	2025-10-09 07:25:18.146
country-kr	KR	Hàn Quốc	South Korea	2025-10-09 07:25:18.148	2025-10-09 07:25:18.147
country-sg	SG	Singapore	Singapore	2025-10-09 07:25:18.149	2025-10-09 07:25:18.148
country-th	TH	Thái Lan	Thailand	2025-10-09 07:25:18.15	2025-10-09 07:25:18.149
country-my	MY	Malaysia	Malaysia	2025-10-09 07:25:18.151	2025-10-09 07:25:18.15
country-id	ID	Indonesia	Indonesia	2025-10-09 07:25:18.152	2025-10-09 07:25:18.151
country-ph	PH	Philippines	Philippines	2025-10-09 07:25:18.153	2025-10-09 07:25:18.152
\.


--
-- Data for Name: md_currencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_currencies (id, code, name, symbol, decimal_places, created_at, updated_at) FROM stdin;
currency-usd	USD	Đô la Mỹ	$	2	2025-10-09 07:25:18.158	2025-10-09 07:25:18.157
currency-vnd	VND	Việt Nam Đồng	₫	0	2025-10-09 07:25:18.155	2025-10-09 07:25:18.154
currency-eur	EUR	Euro	€	2	2025-10-09 07:25:18.159	2025-10-09 07:25:18.158
currency-sgd	SGD	Đô la Singapore	S$	2	2025-10-09 07:25:18.163	2025-10-09 07:25:18.162
currency-cny	CNY	Nhân dân tệ	¥	2	2025-10-09 07:25:18.162	2025-10-09 07:25:18.16
currency-jpy	JPY	Yên Nhật	¥	0	2025-10-09 07:25:18.161	2025-10-09 07:25:18.159
\.


--
-- Data for Name: md_deal_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_deal_types (id, code, name, description, created_at, updated_at) FROM stdin;
2497cead-e7c5-49e4-bb86-f8e5d1198699	SALE	Bán	Giao dịch bán container	2025-10-09 07:30:07.309	2025-10-09 07:41:30.825
2de9190c-dfbd-42a7-947d-5eeca460e0dd	LEASE	Thuê dài hạn	Giao dịch thuê container dài hạn	2025-10-09 07:30:07.309	2025-10-09 07:41:30.828
9547aac3-7606-4e99-9182-8162af29e962	RENTAL	Thuê ngắn hạn	Giao dịch thuê container ngắn hạn	2025-10-09 07:30:07.309	2025-10-09 07:41:30.83
e5084f78-6170-4916-bd47-73466995ab0c	SWAP	Trao đổi	Giao dịch trao đổi container	2025-10-09 07:30:07.309	2025-10-09 07:41:30.831
\.


--
-- Data for Name: md_delivery_event_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_delivery_event_types (id, code, name, description, created_at, updated_at) FROM stdin;
3e5cfd37-550c-41d1-a135-00c06496d549	CREATED	Tạo đơn giao hàng	Đơn giao hàng được tạo	2025-10-09 07:51:30.521	2025-10-09 07:51:30.52
84ebe5c5-f6a0-4f35-95e8-5acb79ca2a64	SCHEDULED	Lên lịch giao hàng	Đã lên lịch giao hàng	2025-10-09 07:51:30.521	2025-10-09 07:51:30.52
b77556dd-f517-4ace-a63d-d9711b156722	PICKED_UP	Nhận hàng	Đã nhận hàng từ kho	2025-10-09 07:51:30.521	2025-10-09 07:51:30.52
826e690a-3d1e-4d38-9b2e-8e03cad1fad9	IN_TRANSIT	Đang vận chuyển	Đang trên đường giao	2025-10-09 07:51:30.521	2025-10-09 07:51:30.52
08a28934-580a-48d0-8baf-cfee3b7977ae	DELIVERED	Đã giao	Đã giao hàng thành công	2025-10-09 07:51:30.521	2025-10-09 07:51:30.52
4e6116a6-54a1-407f-a68b-5b7156bb3206	FAILED	Giao thất bại	Giao hàng thất bại	2025-10-09 07:51:30.521	2025-10-09 07:51:30.52
df19447a-3627-4aa8-ba81-cf97bd6d643f	RETURNED	Hoàn trả	Hàng được hoàn trả	2025-10-09 07:51:30.521	2025-10-09 07:51:30.52
f4c3fdf9-7dfd-4d72-a84a-cf22501831ac	CANCELLED	Hủy giao hàng	Đơn giao hàng bị hủy	2025-10-09 07:51:30.521	2025-10-09 07:51:30.52
\.


--
-- Data for Name: md_delivery_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_delivery_statuses (id, code, name, description, created_at, updated_at) FROM stdin;
7e0da35f-c85f-41d3-a2fe-7a28fd4074a3	PENDING	Chờ giao hàng	Giao hàng đang chờ xử lý	2025-10-09 07:30:07.314	2025-10-09 07:41:30.857
b50d1c3c-c6ca-4094-ab4e-2267a9e2873e	IN_TRANSIT	Đang vận chuyển	Hàng đang được vận chuyển	2025-10-09 07:30:07.314	2025-10-09 07:41:30.859
4a3f9d44-27f7-4f22-bcdf-0180870b2e66	DELIVERED	Đã giao	Giao hàng thành công	2025-10-09 07:30:07.314	2025-10-09 07:41:30.861
1cfc33fc-355b-4703-bb31-79d854811e03	FAILED	Giao hàng thất bại	Giao hàng bị thất bại	2025-10-09 07:30:07.314	2025-10-09 07:41:30.862
16e3e62c-3889-4f6b-8f34-12fd2003f645	CANCELLED	Đã hủy giao hàng	Giao hàng đã bị hủy	2025-10-09 07:30:07.314	2025-10-09 07:41:30.863
\.


--
-- Data for Name: md_dispute_reasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_dispute_reasons (id, code, name, description, created_at, updated_at) FROM stdin;
485d912d-aff3-4e78-89bb-64adc8492b49	QUALITY_ISSUE	Vấn đề chất lượng	Container không đúng chất lượng mô tả	2025-10-09 07:51:30.528	2025-10-09 07:51:30.526
6a919fb0-e094-4505-9e40-f24b960b14f0	DELIVERY_DELAY	Giao hàng trễ	Giao hàng không đúng thời gian	2025-10-09 07:51:30.528	2025-10-09 07:51:30.526
e3e1f275-f46d-46c8-b694-15f94656a2d6	DAMAGE_IN_TRANSIT	Hư hỏng khi vận chuyển	Container bị hư hỏng trong quá trình vận chuyển	2025-10-09 07:51:30.528	2025-10-09 07:51:30.526
8eba7a95-a00f-4e98-aebf-07569643de33	WRONG_ITEM	Sai hàng hóa	Nhận sai container so với đơn hàng	2025-10-09 07:51:30.528	2025-10-09 07:51:30.526
bf307e9c-1e62-48b1-846a-0008e46b4547	PAYMENT_ISSUE	Vấn đề thanh toán	Tranh chấp về thanh toán	2025-10-09 07:51:30.528	2025-10-09 07:51:30.526
d68c0ab6-3cc6-4bea-85f1-722ea1c73014	CONTRACT_BREACH	Vi phạm hợp đồng	Một bên vi phạm điều khoản hợp đồng	2025-10-09 07:51:30.528	2025-10-09 07:51:30.526
2838b82f-77d1-43e0-b728-36da13de68af	DOCUMENTATION	Vấn đề giấy tờ	Thiếu hoặc sai giấy tờ	2025-10-09 07:51:30.528	2025-10-09 07:51:30.526
f66b1ae0-c1b0-4254-a723-4d403fecd423	COMMUNICATION	Vấn đề giao tiếp	Hiểu lầm trong giao tiếp	2025-10-09 07:51:30.528	2025-10-09 07:51:30.526
\.


--
-- Data for Name: md_dispute_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_dispute_statuses (id, code, name, description, created_at, updated_at) FROM stdin;
ab2fa59a-6f6b-4fb9-8374-64f5ff139a09	OPEN	Mở tranh chấp	Tranh chấp đã được mở	2025-10-09 07:32:03.499	2025-10-09 07:41:30.865
dba9c8c3-4c83-4cb4-831a-661ab711b83d	INVESTIGATING	Đang điều tra	Tranh chấp đang được điều tra	2025-10-09 07:32:03.499	2025-10-09 07:41:30.868
6f6fb238-0b2c-4996-af92-45c22245aa46	AWAITING_RESPONSE	Chờ phản hồi	Chờ phản hồi từ các bên liên quan	2025-10-09 07:32:03.499	2025-10-09 07:41:30.87
5f2854d2-2ceb-4887-9def-07e782dbce07	MEDIATION	Đang hòa giải	Tranh chấp đang trong quá trình hòa giải	2025-10-09 07:32:03.499	2025-10-09 07:41:30.871
95736e88-4e54-4d39-a9a4-dfe05b9370bf	RESOLVED_BUYER	Giải quyết có lợi cho người mua	Tranh chấp được giải quyết có lợi cho người mua	2025-10-09 07:32:03.499	2025-10-09 07:41:30.872
af66912d-3b57-403a-aced-770b8202a64e	RESOLVED_SELLER	Giải quyết có lợi cho người bán	Tranh chấp được giải quyết có lợi cho người bán	2025-10-09 07:32:03.499	2025-10-09 07:41:30.872
2e5cadc6-25d2-4f56-85dd-d30151c1e943	RESOLVED_PARTIAL	Giải quyết một phần	Tranh chấp được giải quyết một phần	2025-10-09 07:32:03.499	2025-10-09 07:41:30.873
1881e4a1-cb19-440b-874c-9d937a78f6c3	WITHDRAWN	Đã rút lại	Tranh chấp đã được rút lại	2025-10-09 07:32:03.499	2025-10-09 07:41:30.874
bdd78151-152b-4976-8bf7-eef3f0c11cd3	CLOSED	Đã đóng	Tranh chấp đã được đóng	2025-10-09 07:32:03.499	2025-10-09 07:41:30.875
\.


--
-- Data for Name: md_document_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_document_types (id, code, name, description, created_at, updated_at) FROM stdin;
1a0f7d34-5234-47b1-ba57-db98a76f53e1	INVOICE	Hóa đơn	Hóa đơn thương mại	2025-10-09 07:30:07.335	2025-10-09 07:42:47.86
38598be2-839d-41a2-881a-adec44db579e	RECEIPT	Biên lai	Biên lai thanh toán	2025-10-09 07:30:07.335	2025-10-09 07:42:47.926
6ac55910-a30b-4b90-90a7-47bf4cc671fc	CONTRACT	Hợp đồng	Hợp đồng thỏa thuận	2025-10-09 07:30:07.335	2025-10-09 07:42:47.927
1c2422bf-ea24-4d4b-82d5-20b007c4ea29	INSPECTION_REPORT	Báo cáo kiểm định	Báo cáo kiểm định container	2025-10-09 07:30:07.335	2025-10-09 07:42:47.929
c9874f4b-6ddf-40f0-a2b4-bc30af9aeb49	PHOTO	Ảnh	Tài liệu ảnh chụp	2025-10-09 07:30:07.335	2025-10-09 07:42:47.93
c4b39050-51b3-42e6-8327-b10d0452d305	CERTIFICATE	Chứng chỉ	Chứng chỉ xác nhận	2025-10-09 07:30:07.335	2025-10-09 07:42:47.932
9c677a4f-4502-4774-acf6-9a95bceee798	EDO	Lệnh giao thiết bị	Lệnh giao thiết bị (Equipment Delivery Order)	2025-10-09 07:30:07.335	2025-10-09 07:42:47.933
f5eff63c-6032-4852-aaeb-aef7dc55dec9	EIR	Biên bản giao nhận thiết bị	Biên bản giao nhận thiết bị	2025-10-09 07:30:07.335	2025-10-09 07:42:47.934
94a9ad52-629f-4923-86fa-8d32c02b9ea9	BOL	Vận đơn	Vận đơn đường biển (Bill of Lading)	2025-10-09 07:30:07.335	2025-10-09 07:42:47.935
\.


--
-- Data for Name: md_feature_flag_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_feature_flag_codes (id, code, name, description, created_at, updated_at) FROM stdin;
da54f90d-522c-4922-9cbe-4e85d74b4a95	ADVANCED_SEARCH	Tìm kiếm nâng cao	Tính năng tìm kiếm nâng cao	2025-10-09 07:51:30.534	2025-10-09 07:51:30.532
a67c8e30-6623-4935-8bbe-6da657714faa	REAL_TIME_CHAT	Chat thời gian thực	Tính năng chat trực tiếp	2025-10-09 07:51:30.534	2025-10-09 07:51:30.532
72c05291-ac75-4287-b686-06b7b95ac62d	MOBILE_APP	Ứng dụng di động	Hỗ trợ ứng dụng mobile	2025-10-09 07:51:30.534	2025-10-09 07:51:30.532
f1aadf11-3c62-4f2e-bc4b-0dc07da976a3	API_ACCESS	Truy cập API	Cho phép truy cập API	2025-10-09 07:51:30.534	2025-10-09 07:51:30.532
be859f8a-3541-48aa-9374-f17c84b03ae9	BULK_UPLOAD	Tải lên hàng loạt	Tải lên nhiều container cùng lúc	2025-10-09 07:51:30.534	2025-10-09 07:51:30.532
66e8007e-ed27-408d-bd37-00726023ca46	AUTO_MATCHING	Tự động ghép đôi	Tự động ghép buyer-seller	2025-10-09 07:51:30.534	2025-10-09 07:51:30.532
\.


--
-- Data for Name: md_fee_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_fee_codes (id, code, name, description, created_at, updated_at) FROM stdin;
08225125-99c0-49e4-9f45-09249cbb6bdf	TRANSACTION_FEE	Phí giao dịch	Phí cho mỗi giao dịch thành công	2025-10-09 07:51:30.539	2025-10-09 07:51:30.537
27b04346-18cb-4b1a-a417-3f36675f5a53	LISTING_FEE	Phí đăng tin	Phí đăng tin premium	2025-10-09 07:51:30.539	2025-10-09 07:51:30.537
e731a35e-9311-41fc-8a5e-ab51ac51dcce	INSPECTION_FEE	Phí giám định	Phí dịch vụ giám định container	2025-10-09 07:51:30.539	2025-10-09 07:51:30.537
61da7aa5-22b1-4e29-9b9e-36b567d5001b	DELIVERY_FEE	Phí giao hàng	Phí vận chuyển container	2025-10-09 07:51:30.539	2025-10-09 07:51:30.537
a9a590fe-8b8f-40a5-9308-682483a71944	ESCROW_FEE	Phí ký quỹ	Phí dịch vụ ký quỹ	2025-10-09 07:51:30.539	2025-10-09 07:51:30.537
4f030e7b-3018-437d-9110-a601ff3728d4	PAYMENT_PROCESSING	Phí xử lý thanh toán	Phí xử lý thanh toán online	2025-10-09 07:51:30.539	2025-10-09 07:51:30.537
\.


--
-- Data for Name: md_form_schema_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_form_schema_codes (id, code, name, description, created_at, updated_at) FROM stdin;
061af7e0-a55f-4828-b7ad-5bab7406066a	LISTING_FORM	Form đăng tin	Schema cho form đăng tin container	2025-10-09 07:51:30.545	2025-10-09 07:51:30.543
b7880b2d-32e5-4506-9314-f2aa092a798e	RFQ_FORM	Form RFQ	Schema cho form yêu cầu báo giá	2025-10-09 07:51:30.545	2025-10-09 07:51:30.543
dfddcd77-7796-4f46-914d-bef8edb2b311	INSPECTION_FORM	Form giám định	Schema cho form yêu cầu giám định	2025-10-09 07:51:30.545	2025-10-09 07:51:30.543
76e81f73-f20e-417a-a72c-307153dd7984	USER_PROFILE_FORM	Form hồ sơ người dùng	Schema cho form cập nhật hồ sơ	2025-10-09 07:51:30.545	2025-10-09 07:51:30.543
c155f218-3dc0-4a84-88f3-49626f602adb	COMPANY_REGISTRATION	Form đăng ký doanh nghiệp	Schema cho form đăng ký công ty	2025-10-09 07:51:30.545	2025-10-09 07:51:30.543
2a7ba629-f4a6-47cf-b91a-9d4227c70429	DISPUTE_FORM	Form khiếu nại	Schema cho form khiếu nại tranh chấp	2025-10-09 07:51:30.545	2025-10-09 07:51:30.543
\.


--
-- Data for Name: md_i18n_namespaces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_i18n_namespaces (id, code, name, description, created_at, updated_at) FROM stdin;
39982f22-5b74-429a-95c3-c6c61b9aebc2	COMMON	Chung	Từ khóa chung dùng toàn hệ thống	2025-10-09 07:51:30.55	2025-10-09 07:51:30.548
16614c03-1ff3-483c-a09b-39d42b78c3c0	AUTH	Xác thực	Từ khóa liên quan đến đăng nhập, đăng ký	2025-10-09 07:51:30.55	2025-10-09 07:51:30.548
66ec0f6b-0bb4-4982-a89a-fc898b337f19	LISTINGS	Tin đăng	Từ khóa liên quan đến tin đăng container	2025-10-09 07:51:30.55	2025-10-09 07:51:30.548
b3cf8571-2cac-46ef-be90-064b8ead9b2f	RFQ	Yêu cầu báo giá	Từ khóa liên quan đến RFQ	2025-10-09 07:51:30.55	2025-10-09 07:51:30.548
dcd53cf7-baac-476f-b161-d398c6e903c1	ORDERS	Đơn hàng	Từ khóa liên quan đến đơn hàng	2025-10-09 07:51:30.55	2025-10-09 07:51:30.548
9c1ff77a-acdf-44c5-85b2-6a2815c2e78e	ADMIN	Quản trị	Từ khóa dành cho admin panel	2025-10-09 07:51:30.55	2025-10-09 07:51:30.548
aaffebbb-7895-430d-9891-cbc5b9b1c5b8	ERRORS	Lỗi	Thông báo lỗi hệ thống	2025-10-09 07:51:30.55	2025-10-09 07:51:30.548
6a3a40b9-c3ac-4f3e-87f9-164a0b7b1d07	SUCCESS	Thành công	Thông báo thành công	2025-10-09 07:51:30.55	2025-10-09 07:51:30.548
\.


--
-- Data for Name: md_incoterms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_incoterms (id, code, name, description, created_at, updated_at) FROM stdin;
2e512b45-d9db-47ab-8112-dd1e01653122	EXW	Giao tại xưởng	Giao tại xưởng (địa điểm được đặt tên)	2025-10-09 07:30:07.351	2025-10-09 07:42:47.973
acba5c9d-e9c7-469e-8f2d-3d362df43aa7	FCA	Giao cho người vận chuyển	Giao cho người vận chuyển (địa điểm được đặt tên)	2025-10-09 07:30:07.351	2025-10-09 07:42:47.976
78666fc7-43ca-4bfb-a30e-7c27721df506	CPT	Cước phí trả đến	Cước phí trả đến (địa điểm đích được đặt tên)	2025-10-09 07:30:07.351	2025-10-09 07:42:47.977
3f6cf346-59ec-4812-813c-a72c93c560a7	CIP	Cước phí và bảo hiểm trả đến	Cước phí và bảo hiểm trả đến (địa điểm đích được đặt tên)	2025-10-09 07:30:07.351	2025-10-09 07:42:47.977
5621199f-dc35-476f-92c1-103d68ba539f	DAP	Giao tại địa điểm	Giao tại địa điểm (địa điểm đích được đặt tên)	2025-10-09 07:30:07.351	2025-10-09 07:42:47.978
3a326c21-0e56-4a9e-b9c6-87b1f1018ab9	DPU	Giao và dỡ tại địa điểm	Giao và dỡ tại địa điểm (địa điểm đích được đặt tên)	2025-10-09 07:30:07.351	2025-10-09 07:42:47.979
c44acbcd-74e7-4044-814e-96a52f0e3c0b	DDP	Giao đã nộp thuế	Giao đã nộp thuế (địa điểm đích được đặt tên)	2025-10-09 07:30:07.351	2025-10-09 07:42:47.981
70a1c008-4e92-40ec-b0d1-f80a88c44ba8	FAS	Giao dọc mạn tàu	Giao dọc mạn tàu (cảng giao hàng được đặt tên)	2025-10-09 07:30:07.351	2025-10-09 07:42:47.982
b0c75a70-dbc2-4779-b23c-791766cfa893	FOB	Giao lên tàu	Giao lên tàu (cảng giao hàng được đặt tên)	2025-10-09 07:30:07.351	2025-10-09 07:42:47.982
6842fafa-fcec-44f4-b0cf-2c1c8954f83f	CFR	Giá và cước phí	Giá và cước phí (cảng đích được đặt tên)	2025-10-09 07:30:07.351	2025-10-09 07:42:47.983
7073170d-6267-42fc-9939-3cd3c5688686	CIF	Giá, bảo hiểm và cước phí	Giá, bảo hiểm và cước phí (cảng đích được đặt tên)	2025-10-09 07:30:07.351	2025-10-09 07:42:47.984
\.


--
-- Data for Name: md_inspection_item_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_inspection_item_codes (id, code, name, description, created_at, updated_at) FROM stdin;
4273b144-56ce-4bbc-aa92-836c3ff86a13	EXTERIOR_WALLS	Tường ngoài	Kiểm tra tường bên ngoài container	2025-10-09 07:51:30.555	2025-10-09 07:51:30.553
933f192f-da24-493b-94eb-9b935841873b	INTERIOR_WALLS	Tường trong	Kiểm tra tường bên trong container	2025-10-09 07:51:30.555	2025-10-09 07:51:30.553
ac9e4e69-2d69-40fa-b5a2-f2600a7976b2	FLOOR	Sàn container	Kiểm tra sàn container	2025-10-09 07:51:30.555	2025-10-09 07:51:30.553
112910c7-441d-417e-bf9e-3cdfb214df35	ROOF	Mái container	Kiểm tra mái container	2025-10-09 07:51:30.555	2025-10-09 07:51:30.553
7f345d01-260f-47d5-9ef4-ea0124c847b8	DOORS	Cửa container	Kiểm tra cửa và khóa container	2025-10-09 07:51:30.555	2025-10-09 07:51:30.553
142a2e7a-7705-4802-b658-58cd8d9bd8e4	CORNERS	Góc container	Kiểm tra 4 góc container	2025-10-09 07:51:30.555	2025-10-09 07:51:30.553
2161a4fa-2298-4c10-afbd-c6e78e74d5a1	SEALS	Gioăng cửa	Kiểm tra gioăng chống thấm	2025-10-09 07:51:30.555	2025-10-09 07:51:30.553
de3603d0-b64c-4ce2-9a44-4c98da037725	MARKINGS	Ký hiệu	Kiểm tra ký hiệu và số container	2025-10-09 07:51:30.555	2025-10-09 07:51:30.553
63cd0172-0e05-45e1-81a2-d7aa7dbbb45c	VENTILATION	Thông gió	Kiểm tra hệ thống thông gió	2025-10-09 07:51:30.555	2025-10-09 07:51:30.553
ef81a66a-8b61-472d-8221-e3f72c3d8db1	ELECTRICAL	Điện	Kiểm tra hệ thống điện (với reefer)	2025-10-09 07:51:30.555	2025-10-09 07:51:30.554
\.


--
-- Data for Name: md_insurance_coverages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_insurance_coverages (id, code, name, description, created_at, updated_at) FROM stdin;
45c2e039-05b0-4891-ad66-4dc270cf1d47	BASIC	Bảo hiểm cơ bản	Bảo hiểm thiệt hại cơ bản	2025-10-09 07:51:30.591	2025-10-09 07:51:30.59
a1f3b3ef-45c2-4571-a6f4-f13279edd736	COMPREHENSIVE	Bảo hiểm toàn diện	Bảo hiểm toàn diện mọi rủi ro	2025-10-09 07:51:30.591	2025-10-09 07:51:30.59
e0ec4e52-2724-4527-b3ea-c839dc667c06	THEFT_ONLY	Chỉ bảo hiểm trộm cắp	Chỉ bảo hiểm mất trộm	2025-10-09 07:51:30.591	2025-10-09 07:51:30.59
8914d4ed-a748-4d99-a4ca-42e7cd62894f	FIRE_FLOOD	Hỏa hoạn và lũ lụt	Bảo hiểm hỏa hoạn và thiên tai	2025-10-09 07:51:30.591	2025-10-09 07:51:30.59
659dd249-55da-463b-b147-69eaefd3e275	TRANSIT	Bảo hiểm vận chuyển	Bảo hiểm trong quá trình vận chuyển	2025-10-09 07:51:30.591	2025-10-09 07:51:30.59
\.


--
-- Data for Name: md_integration_vendor_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_integration_vendor_codes (id, code, name, description, created_at, updated_at) FROM stdin;
00ed9a6d-95c1-4e32-aa3b-af6472ce610b	VNPAY	VNPay	Cổng thanh toán VNPay	2025-10-09 07:51:30.597	2025-10-09 07:51:30.595
3c90b6ae-1618-41e6-b269-6d228bcbb5db	MOMO	MoMo	Ví điện tử MoMo	2025-10-09 07:51:30.597	2025-10-09 07:51:30.595
68666580-0da0-4bec-808d-6efe98a9680c	ZALOPAY	ZaloPay	Ví điện tử ZaloPay	2025-10-09 07:51:30.597	2025-10-09 07:51:30.595
06e9e779-a45b-4f4d-80fa-195c14cc4b6d	VIETTEL_POST	Viettel Post	Dịch vụ chuyển phát Viettel	2025-10-09 07:51:30.597	2025-10-09 07:51:30.595
23d33a27-6533-45c1-969b-2d297d7f5a35	VIETNAM_POST	Vietnam Post	Bưu điện Việt Nam	2025-10-09 07:51:30.597	2025-10-09 07:51:30.595
524505c1-8154-4aa0-8a92-f9ae6cd33d27	GHN	Giao Hàng Nhanh	Dịch vụ giao hàng nhanh	2025-10-09 07:51:30.597	2025-10-09 07:51:30.595
\.


--
-- Data for Name: md_iso_container_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_iso_container_codes (id, iso_code, description, created_at, updated_at) FROM stdin;
2f77e63c-1635-4f9a-bcd0-0b5e9a06aad7	22G1	Container 20 feet đa dụng tiêu chuẩn	2025-10-09 07:30:07.302	2025-10-09 07:41:30.814
c40e4cf2-2ef6-4698-836f-6084052a2706	42G1	Container 40 feet đa dụng tiêu chuẩn	2025-10-09 07:30:07.302	2025-10-09 07:41:30.817
23ca1001-3daf-45ea-9cdb-97ab9832828a	45G1	Container 45 feet cao (High Cube)	2025-10-09 07:30:07.302	2025-10-09 07:41:30.818
63265c75-7458-42c4-9438-9ac7e65b3d7a	22R1	Container 20 feet có hệ thống làm lạnh	2025-10-09 07:30:07.302	2025-10-09 07:41:30.819
649c12af-36f4-4782-bbf7-4de71cf5cdc9	42R1	Container 40 feet có hệ thống làm lạnh	2025-10-09 07:30:07.302	2025-10-09 07:41:30.82
4dc4b096-2f31-46f6-b747-d3997db4c8b3	22U1	Container 20 feet nóc mở	2025-10-09 07:30:07.302	2025-10-09 07:41:30.821
33cef0f6-0d83-4f50-a2c4-864c0e692362	42U1	Container 40 feet nóc mở	2025-10-09 07:30:07.302	2025-10-09 07:41:30.822
e867b301-92e2-4280-8e7e-e048e6514519	22P1	Container 20 feet sàn phẳng	2025-10-09 07:30:07.302	2025-10-09 07:41:30.823
07779fb1-e610-44a2-87c1-637fe9601709	42P1	Container 40 feet sàn phẳng	2025-10-09 07:30:07.302	2025-10-09 07:41:30.823
7c0cf65c-dd5b-4d49-9d74-1ff4daa170ba	22T1	Container 20 feet dạng bồn chứa	2025-10-09 07:30:07.302	2025-10-09 07:41:30.824
\.


--
-- Data for Name: md_listing_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_listing_statuses (id, code, name, description, created_at, updated_at) FROM stdin;
e9b33074-c286-4cad-b931-1baccd5dcfc6	DRAFT	Bản nháp	Tin đăng đang ở trạng thái bản nháp	2025-10-09 07:30:07.324	2025-10-09 07:41:30.832
f6376741-977a-48f0-a66c-6b78eaacc5c9	PENDING_APPROVAL	Chờ duyệt	Tin đăng đang chờ được duyệt	2025-10-09 07:30:07.324	2025-10-09 07:41:30.835
f2017e7b-ce04-4cc0-a0c5-dca4aa744cf0	ACTIVE	Đang hoạt động	Tin đăng đang hoạt động và hiển thị	2025-10-09 07:30:07.324	2025-10-09 07:41:30.836
218fa2fc-fb59-4f11-b3e9-a08fdd7aa8d1	EXPIRED	Hết hạn	Tin đăng đã hết hạn	2025-10-09 07:30:07.324	2025-10-09 07:41:30.837
b3261c2a-513b-4243-94ab-bea93b682702	SOLD	Đã bán	Container trong tin đăng đã được bán	2025-10-09 07:30:07.324	2025-10-09 07:41:30.837
35a24d4b-ec99-409c-8ac0-b4cb2089b581	SUSPENDED	Tạm ngưng	Tin đăng bị tạm ngưng	2025-10-09 07:30:07.324	2025-10-09 07:41:30.838
d884bddb-103e-42ab-92d2-856b19a78395	PENDING_REVIEW	Chờ duyệt	Tin đăng đang chờ được duyệt	2025-10-10 01:20:52.184	2025-10-10 01:20:52.184
dfc25389-5a19-4b47-9ea1-c2d794c4f611	PAUSED	Tạm dừng	Tin đăng bị tạm dừng hiển thị	2025-10-10 01:20:52.285	2025-10-10 01:20:52.285
a0276892-4adf-4028-866a-22afcfb6448f	RENTED	Đã cho thuê	Container trong tin đăng đã được cho thuê	2025-10-10 01:20:52.361	2025-10-10 01:20:52.361
e2aeca28-cd23-436c-9082-5b882719a5ac	ARCHIVED	Lưu trữ	Tin đăng đã được lưu trữ	2025-10-10 01:20:52.437	2025-10-10 01:20:52.437
ed5c8d11-9f45-4f44-af2a-2dda725a75f8	REJECTED	Bị từ chối	Tin đăng bị từ chối duyệt	2025-10-10 01:20:52.519	2025-10-10 01:20:52.519
\.


--
-- Data for Name: md_movement_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_movement_types (id, code, name, description, created_at, updated_at) FROM stdin;
d7e5107c-08aa-4322-a279-d20f6123d557	GATE_IN	Vào cổng	Container vào depot	2025-10-09 07:30:07.329	2025-10-09 07:42:47.958
e2b2d2a7-abde-44e4-a9eb-0682f36e2b3b	GATE_OUT	Ra cổng	Container rời depot	2025-10-09 07:30:07.329	2025-10-09 07:42:47.96
255317e4-8c9f-4c78-afa0-ce1dc47b0d0f	STRIP	Dỡ hàng	Container đang được dỡ hàng	2025-10-09 07:30:07.329	2025-10-09 07:42:47.961
31d20db8-cf2f-48a2-b3ec-f179aebbb084	STUFF	Xếp hàng	Container đang được xếp hàng	2025-10-09 07:30:07.329	2025-10-09 07:42:47.962
b0bed865-0239-4666-9aa8-9b88bb57cc4a	INSPECTION	Kiểm định	Kiểm định container	2025-10-09 07:30:07.329	2025-10-09 07:42:47.963
ed3300e4-89f3-4e8d-9607-1f6e3cd3f613	REPAIR	Sửa chữa	Hoạt động sửa chữa container	2025-10-09 07:30:07.329	2025-10-09 07:42:47.964
\.


--
-- Data for Name: md_notification_channels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_notification_channels (id, code, name, description, created_at, updated_at) FROM stdin;
20e7385c-868e-4b13-854b-4acd303c4ab3	EMAIL	Email	Thông báo qua email	2025-10-09 07:51:30.561	2025-10-09 07:51:30.559
f1f2aa1b-269d-43d5-9bf9-194f46d88d0a	SMS	SMS	Thông báo qua tin nhắn	2025-10-09 07:51:30.561	2025-10-09 07:51:30.559
d5679da8-25c3-4b62-9a05-7d02c8ef7bb5	IN_APP	Trong ứng dụng	Thông báo trong ứng dụng	2025-10-09 07:51:30.561	2025-10-09 07:51:30.559
8f71f266-e47c-42c4-9eb1-5b14ba434190	PUSH	Push notification	Thông báo đẩy trên mobile	2025-10-09 07:51:30.561	2025-10-09 07:51:30.559
6905ec95-11c1-4d1c-8b96-3fe57e5210a3	WEBHOOK	Webhook	Thông báo qua webhook API	2025-10-09 07:51:30.561	2025-10-09 07:51:30.559
\.


--
-- Data for Name: md_notification_event_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_notification_event_types (id, code, name, description, created_at, updated_at) FROM stdin;
fbebecd8-630e-416a-926d-c278c59ed9df	NEW_MESSAGE	Tin nhắn mới	Có tin nhắn mới	2025-10-09 07:51:30.566	2025-10-09 07:51:30.565
fcec00dd-8293-44f8-92d9-ed47ac69a3a5	NEW_RFQ	RFQ mới	Có yêu cầu báo giá mới	2025-10-09 07:51:30.566	2025-10-09 07:51:30.565
6e47238d-b277-46b9-aa04-6c3d357ce09d	NEW_QUOTE	Báo giá mới	Có báo giá mới	2025-10-09 07:51:30.566	2025-10-09 07:51:30.565
231b2cad-8bd2-4462-816b-1db2ce5ed945	ORDER_STATUS_CHANGE	Thay đổi trạng thái đơn hàng	Đơn hàng thay đổi trạng thái	2025-10-09 07:51:30.566	2025-10-09 07:51:30.565
bf6ef3eb-a95d-42fb-8a7e-63b9c61f25fe	PAYMENT_RECEIVED	Nhận thanh toán	Đã nhận được thanh toán	2025-10-09 07:51:30.566	2025-10-09 07:51:30.565
f38176cd-94f1-4e46-8cbb-e33ca91b58f0	LISTING_APPROVED	Tin đăng được duyệt	Tin đăng đã được phê duyệt	2025-10-09 07:51:30.566	2025-10-09 07:51:30.565
571aecd8-1334-4fe2-9f7d-110ac66eb6ae	LISTING_REJECTED	Tin đăng bị từ chối	Tin đăng bị từ chối	2025-10-09 07:51:30.566	2025-10-09 07:51:30.565
e6931d09-03c5-416e-a896-f085afb17ed6	INSPECTION_SCHEDULED	Lên lịch giám định	Đã lên lịch giám định container	2025-10-09 07:51:30.566	2025-10-09 07:51:30.565
\.


--
-- Data for Name: md_order_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_order_statuses (id, code, name, description, created_at, updated_at) FROM stdin;
a1c85ffb-04aa-414d-9525-d696a024353f	PENDING	Chờ xử lý	Đơn hàng đang chờ xác nhận	2025-10-09 07:30:07.319	2025-10-09 07:41:30.839
df27d6b5-de31-4c02-b1bf-c10ddcb77609	CONFIRMED	Đã xác nhận	Đơn hàng đã được xác nhận	2025-10-09 07:30:07.319	2025-10-09 07:41:30.842
8d22a759-8fbc-48f5-b524-4d98d8698d90	IN_PROGRESS	Đang xử lý	Đơn hàng đang được xử lý	2025-10-09 07:30:07.319	2025-10-09 07:41:30.843
84357a5f-1bc4-4c4b-89a1-79e8dca2ab5e	COMPLETED	Hoàn thành	Đơn hàng đã hoàn thành thành công	2025-10-09 07:30:07.319	2025-10-09 07:41:30.844
ccc769cb-7372-4c0a-8c37-9f3934abf561	CANCELLED	Đã hủy	Đơn hàng đã bị hủy	2025-10-09 07:30:07.319	2025-10-09 07:41:30.845
602c9204-f4be-44f9-81d1-45df51b57b0a	REFUNDED	Đã hoàn tiền	Đơn hàng đã được hoàn tiền	2025-10-09 07:30:07.319	2025-10-09 07:41:30.846
\.


--
-- Data for Name: md_partner_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_partner_types (id, code, name, description, created_at, updated_at) FROM stdin;
65dd88ec-f4f6-47da-bf8a-9f1135aa2836	SUPPLIER	Nhà cung cấp	Đối tác cung cấp container	2025-10-09 07:32:03.506	2025-10-09 07:42:47.948
9e4e2392-518a-4ca1-aed0-890b893eeb3c	BUYER	Người mua	Đối tác mua container	2025-10-09 07:32:03.506	2025-10-09 07:42:47.951
715b1ebc-2972-4f11-90d8-35b1118c6024	LOGISTICS	Nhà cung cấp logistics	Đối tác cung cấp dịch vụ logistics	2025-10-09 07:32:03.506	2025-10-09 07:42:47.952
cd38d9db-3819-48d7-8ce2-d9d587882a3d	DEPOT	Người vận hành depot	Đối tác vận hành depot container	2025-10-09 07:32:03.506	2025-10-09 07:42:47.953
e2e2c69b-b30b-4e09-9fd0-bb5b66a763a6	INSPECTOR	Đơn vị kiểm định	Đối tác cung cấp dịch vụ kiểm định container	2025-10-09 07:32:03.506	2025-10-09 07:42:47.954
5dbd62b4-8366-4360-8a0f-75c189ad3ca1	FINANCIER	Nhà tài chính	Đối tác cung cấp dịch vụ tài chính	2025-10-09 07:32:03.506	2025-10-09 07:42:47.955
ce27b887-2839-46b6-9247-054593380d8d	INSURANCE	Nhà cung cấp bảo hiểm	Đối tác cung cấp dịch vụ bảo hiểm	2025-10-09 07:32:03.506	2025-10-09 07:42:47.956
0f127167-8a84-49c7-b5cc-f5e9bd3905c8	SHIPPER	Hãng tàu	Đối tác hãng tàu vận chuyển	2025-10-09 07:32:03.506	2025-10-09 07:42:47.956
\.


--
-- Data for Name: md_payment_failure_reasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_payment_failure_reasons (id, code, name, description, created_at, updated_at) FROM stdin;
ff71f123-58be-4316-9857-ab82fa893ca7	INSUFFICIENT_FUNDS	Không đủ tiền	Tài khoản không đủ số dư	2025-10-09 07:51:30.571	2025-10-09 07:51:30.57
0793a82b-9e1e-4dde-9a23-609830172916	CARD_EXPIRED	Thẻ hết hạn	Thẻ tín dụng đã hết hạn	2025-10-09 07:51:30.571	2025-10-09 07:51:30.57
03e1a4f4-1c9d-4907-b842-516691e3fbb7	CARD_DECLINED	Thẻ bị từ chối	Ngân hàng từ chối giao dịch	2025-10-09 07:51:30.571	2025-10-09 07:51:30.57
77872924-b1ed-4542-aac8-c79680b8126f	NETWORK_ERROR	Lỗi mạng	Lỗi kết nối mạng	2025-10-09 07:51:30.571	2025-10-09 07:51:30.57
8317e141-85b5-4192-b573-030614248912	INVALID_CARD	Thẻ không hợp lệ	Thông tin thẻ không đúng	2025-10-09 07:51:30.571	2025-10-09 07:51:30.57
6537066e-83ea-4522-8bc8-616cd868d666	FRAUD_DETECTED	Phát hiện gian lận	Hệ thống phát hiện giao dịch gian lận	2025-10-09 07:51:30.571	2025-10-09 07:51:30.57
\.


--
-- Data for Name: md_payment_method_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_payment_method_types (id, code, name, description, created_at, updated_at) FROM stdin;
5b85713a-6433-4146-b4dc-4ae25b2ab5ad	CREDIT_CARD	Thẻ tín dụng	Thanh toán bằng thẻ tín dụng	2025-10-09 07:30:07.345	2025-10-09 07:42:47.966
204943bc-7a43-4f87-be2f-3c0917b81c15	BANK_TRANSFER	Chuyển khoản ngân hàng	Chuyển khoản qua ngân hàng	2025-10-09 07:30:07.345	2025-10-09 07:42:47.969
0ffb141d-fd63-4a3e-a901-e07d923e6f1f	PAYPAL	PayPal	Thanh toán qua PayPal	2025-10-09 07:30:07.345	2025-10-09 07:42:47.969
f1ed1961-9119-4fb1-aadd-29d1bad8223a	CASH	Tiền mặt	Thanh toán bằng tiền mặt	2025-10-09 07:30:07.345	2025-10-09 07:42:47.97
3a443bab-f578-4a7c-bca3-caa141c06e39	CHECK	Séc	Thanh toán bằng séc	2025-10-09 07:30:07.345	2025-10-09 07:42:47.971
3ce3eed4-5e21-4fc3-aa89-9395c295f187	CRYPTOCURRENCY	Tiền điện tử	Thanh toán bằng tiền điện tử	2025-10-09 07:30:07.345	2025-10-09 07:42:47.972
\.


--
-- Data for Name: md_payment_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_payment_statuses (id, code, name, description, created_at, updated_at) FROM stdin;
fabe5000-aabe-48c3-99c3-e6a628bbd41d	PENDING	Chờ thanh toán	Thanh toán đang chờ xử lý	2025-10-09 07:32:03.493	2025-10-09 07:41:30.847
5ae05ee8-685d-4cc7-8da6-b50c683418f1	AUTHORIZED	Đã ủy quyền	Thanh toán đã được ủy quyền	2025-10-09 07:32:03.493	2025-10-09 07:41:30.85
fbca41c3-029e-4d42-ad62-389a07bc4cfd	CAPTURED	Đã thu tiền	Tiền đã được thu thành công	2025-10-09 07:32:03.493	2025-10-09 07:41:30.851
13a18ddf-0d90-4ca3-96d8-c572e3628bb2	COMPLETED	Hoàn thành	Thanh toán đã hoàn thành	2025-10-09 07:32:03.493	2025-10-09 07:41:30.852
7a84e456-4238-4b0d-b96b-c362d4edf9cb	FAILED	Thất bại	Thanh toán bị thất bại	2025-10-09 07:32:03.493	2025-10-09 07:41:30.853
cca95c4b-9bb4-4792-9c1b-2066cc5c15a4	CANCELLED	Đã hủy	Thanh toán đã bị hủy	2025-10-09 07:32:03.493	2025-10-09 07:41:30.854
81ca4373-6f1f-4ea4-959e-d574b6b42023	REFUNDED	Đã hoàn tiền	Thanh toán đã được hoàn tiền	2025-10-09 07:32:03.493	2025-10-09 07:41:30.855
bcfbcded-d262-46df-a1f9-d93a39289383	PARTIAL_REFUND	Hoàn tiền một phần	Thanh toán được hoàn tiền một phần	2025-10-09 07:32:03.493	2025-10-09 07:41:30.855
\.


--
-- Data for Name: md_pricing_regions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_pricing_regions (id, code, name, description, created_at, updated_at) FROM stdin;
46cd5f7d-de8e-48d1-b274-e151e9d1407c	NORTH	Miền Bắc	Khu vực miền Bắc Việt Nam	2025-10-09 07:51:30.582	2025-10-09 07:51:30.58
f23d0f87-5c99-49fe-af12-dee70499d544	CENTRAL	Miền Trung	Khu vực miền Trung Việt Nam	2025-10-09 07:51:30.582	2025-10-09 07:51:30.58
40c2a6a1-f7bb-42ad-92e5-5960d693ff98	SOUTH	Miền Nam	Khu vực miền Nam Việt Nam	2025-10-09 07:51:30.582	2025-10-09 07:51:30.58
091cfa2a-dc75-4c4e-91f8-afa0a491772c	INTERNATIONAL	Quốc tế	Khu vực quốc tế	2025-10-09 07:51:30.582	2025-10-09 07:51:30.58
\.


--
-- Data for Name: md_provinces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_provinces (id, country_id, code, name, name_en, created_at, updated_at) FROM stdin;
province-hn	country-vn	VN-HN	Hà Nội	Hanoi	2025-10-09 07:25:18.165	2025-10-09 07:25:18.163
province-hp	country-vn	VN-HP	Hải Phòng	Hai Phong	2025-10-09 07:25:18.168	2025-10-09 07:25:18.166
province-dn	country-vn	VN-DN	Đà Nẵng	Da Nang	2025-10-09 07:25:18.169	2025-10-09 07:25:18.167
province-sg	country-vn	VN-SG	TP. Hồ Chí Minh	Ho Chi Minh City	2025-10-09 07:25:18.17	2025-10-09 07:25:18.169
province-bd	country-vn	VN-BD	Bình Dương	Binh Duong	2025-10-09 07:25:18.171	2025-10-09 07:25:18.17
province-dn-dong	country-vn	VN-DN-DONG	Đồng Nai	Dong Nai	2025-10-09 07:25:18.172	2025-10-09 07:25:18.171
province-br-vt	country-vn	VN-BR-VT	Bà Rịa - Vũng Tàu	Ba Ria - Vung Tau	2025-10-09 07:25:18.173	2025-10-09 07:25:18.172
province-ct	country-vn	VN-CT	Cần Thơ	Can Tho	2025-10-09 07:25:18.174	2025-10-09 07:25:18.173
\.


--
-- Data for Name: md_quality_standards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_quality_standards (id, code, name, description, created_at, updated_at) FROM stdin;
quality-iicl	IICL	Tiêu chuẩn IICL	Tiêu chuẩn chất lượng cao nhất theo IICL	2025-10-09 07:25:18.205	2025-10-09 07:41:30.807
quality-cw	CW	Đạt chuẩn vận chuyển	Chất lượng tốt, đủ tiêu chuẩn vận chuyển hàng hóa	2025-10-09 07:25:18.204	2025-10-09 07:41:30.809
quality-wwt	WWT	Kín gió và nước	Container kín gió và nước, chất lượng tốt	2025-10-09 07:25:18.201	2025-10-09 07:41:30.81
quality-asis	ASIS	Tình trạng hiện tại	Bán theo tình trạng hiện tại, không bảo hành	2025-10-09 07:25:18.206	2025-10-09 07:41:30.812
\.


--
-- Data for Name: md_rating_scales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_rating_scales (id, code, name, description, created_at, updated_at) FROM stdin;
4f337850-c186-4295-8439-b78775ed2a06	FIVE_STAR	Thang điểm 5 sao	Đánh giá từ 1 đến 5 sao	2025-10-09 07:51:30.587	2025-10-09 07:51:30.585
82a40066-bf17-48af-873e-8d658560d718	TEN_POINT	Thang điểm 10	Đánh giá từ 1 đến 10 điểm	2025-10-09 07:51:30.587	2025-10-09 07:51:30.585
8a790bc1-0aab-48e6-bf5e-eff60d90ac13	HUNDRED_POINT	Thang điểm 100	Đánh giá từ 0 đến 100 điểm	2025-10-09 07:51:30.587	2025-10-09 07:51:30.585
48a1c86a-81f1-434c-a454-def74996b8d4	PASS_FAIL	Đạt/Không đạt	Chỉ có 2 mức đạt hoặc không đạt	2025-10-09 07:51:30.587	2025-10-09 07:51:30.585
\.


--
-- Data for Name: md_redaction_channels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_redaction_channels (id, code, name, description, created_at, updated_at) FROM stdin;
6693fe09-a937-44d6-b520-fd0d8f1e2bd2	CHAT	Tin nhắn chat	Che thông tin trong chat	2025-10-09 07:53:14.541	2025-10-09 07:53:14.538
05221496-b5c3-486e-8944-a1150cdfb762	LISTING	Tin đăng	Che thông tin trong tin đăng	2025-10-09 07:53:14.541	2025-10-09 07:53:14.538
5eddc4b2-2ff9-483e-83d3-a169cb6dfa8e	REVIEW	Đánh giá	Che thông tin trong đánh giá	2025-10-09 07:53:14.541	2025-10-09 07:53:14.538
03c16c8a-5ac3-4822-8b73-0a1e19e92b7e	PROFILE	Hồ sơ	Che thông tin trong hồ sơ	2025-10-09 07:53:14.541	2025-10-09 07:53:14.538
05fb039a-f423-463c-9d92-568568fcf75f	COMMENT	Bình luận	Che thông tin trong bình luận	2025-10-09 07:53:14.541	2025-10-09 07:53:14.538
\.


--
-- Data for Name: md_ref_doc_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_ref_doc_types (id, code, name, description, created_at, updated_at) FROM stdin;
445c729f-0244-4d0a-9710-ddce858ec561	ORDER	Đơn hàng	Tài liệu tham chiếu đơn hàng	2025-10-09 07:53:14.548	2025-10-09 07:53:14.547
9bde4cb7-7749-4026-989e-7a755d3fda66	INSPECTION	Giám định	Tài liệu tham chiếu giám định	2025-10-09 07:53:14.548	2025-10-09 07:53:14.547
e6175ad4-d845-444a-b7ad-d59f68d695bd	REPAIR	Sửa chữa	Tài liệu tham chiếu sửa chữa	2025-10-09 07:53:14.548	2025-10-09 07:53:14.547
2da1407e-07ce-425c-9610-6f7b7a39a98d	TRANSFER	Chuyển kho	Tài liệu tham chiếu chuyển kho	2025-10-09 07:53:14.548	2025-10-09 07:53:14.547
37288fc6-63aa-4d2b-b224-c7c72d09a037	ADJUSTMENT	Điều chỉnh	Tài liệu tham chiếu điều chỉnh tồn kho	2025-10-09 07:53:14.548	2025-10-09 07:53:14.547
c0b37bd2-1aa4-4c5b-a61e-721cacf312e3	INVOICE	Hóa đơn	Tài liệu tham chiếu hóa đơn	2025-10-09 07:53:14.548	2025-10-09 07:53:14.547
\.


--
-- Data for Name: md_rental_units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_rental_units (id, code, name, description, created_at, updated_at) FROM stdin;
d4c9f240-edc3-46f7-903b-f5adff8d0772	DAY	Ngày	Thuê theo ngày	2025-10-09 07:51:30.577	2025-10-09 07:51:30.575
2667e02b-758c-42fd-b873-90f88bc588c6	WEEK	Tuần	Thuê theo tuần	2025-10-09 07:51:30.577	2025-10-09 07:51:30.575
26bd0e50-09c4-4ff7-b8a9-8dfbbb92632c	MONTH	Tháng	Thuê theo tháng	2025-10-09 07:51:30.577	2025-10-09 07:51:30.575
da6f4fae-71c1-41a5-81f2-48ffc3e57c15	QUARTER	Quý	Thuê theo quý	2025-10-09 07:51:30.577	2025-10-09 07:51:30.575
58736e74-b873-4219-be3a-aadbf7829f68	YEAR	Năm	Thuê theo năm	2025-10-09 07:51:30.577	2025-10-09 07:51:30.575
7ba91b2f-4b6f-4a5f-a292-d189cb85795e	TRIP	Chuyến	Thuê theo chuyến đi	2025-10-09 07:51:30.577	2025-10-09 07:51:30.575
\.


--
-- Data for Name: md_repair_item_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_repair_item_codes (id, code, name, description, created_at, updated_at) FROM stdin;
31149862-bd21-4717-8368-57d2727d241d	WELDING	Hàn	Hàn vá các vị trí hư hỏng	2025-10-09 07:53:14.554	2025-10-09 07:53:14.553
1817fdb9-a16e-447d-b4f9-7284be892c94	PAINTING	Sơn	Sơn lại container	2025-10-09 07:53:14.554	2025-10-09 07:53:14.553
3b4aeda9-a6d0-4af0-9fd5-101fb9d28176	DOOR_REPAIR	Sửa cửa	Sửa chữa cửa container	2025-10-09 07:53:14.554	2025-10-09 07:53:14.553
ffdadccf-a5d0-45c5-8381-2890f2365240	FLOOR_REPAIR	Sửa sàn	Sửa chữa sàn container	2025-10-09 07:53:14.554	2025-10-09 07:53:14.553
59665f10-26fa-4a36-b7e1-0c61a9ffce5b	ROOF_REPAIR	Sửa mái	Sửa chữa mái container	2025-10-09 07:53:14.554	2025-10-09 07:53:14.553
140b63e5-d8b1-42f7-b7dd-87ab1a7085b1	SEAL_REPLACEMENT	Thay gioăng	Thay gioăng chống thấm	2025-10-09 07:53:14.554	2025-10-09 07:53:14.553
b2bf892c-01ce-4bcb-9ac9-b5d821ce8dc1	CLEANING	Vệ sinh	Vệ sinh container	2025-10-09 07:53:14.554	2025-10-09 07:53:14.553
7a3c38e4-89ea-4036-9b99-7a0ceb365e05	FUMIGATION	Xông khói	Xông khói diệt khuẩn	2025-10-09 07:53:14.554	2025-10-09 07:53:14.553
\.


--
-- Data for Name: md_service_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_service_codes (id, code, name, description, created_at, updated_at) FROM stdin;
54351857-e65a-4499-ae91-f930a8517021	STORAGE	Lưu kho	Dịch vụ lưu trữ container	2025-10-09 07:30:07.34	2025-10-09 07:42:47.937
c9e1d5c9-73ec-4d27-983f-ef25e1e6d961	TRANSPORT	Vận chuyển	Dịch vụ vận chuyển container	2025-10-09 07:30:07.34	2025-10-09 07:42:47.94
75c425a2-3c8d-4a4b-84fe-6f12d36b5277	INSPECTION	Kiểm định	Dịch vụ kiểm định container	2025-10-09 07:30:07.34	2025-10-09 07:42:47.941
79ad3b32-7791-4908-b06c-aa4d2e153705	REPAIR	Sửa chữa	Dịch vụ sửa chữa container	2025-10-09 07:30:07.34	2025-10-09 07:42:47.942
20db9bdb-dac7-4697-8dda-79827b26594f	CLEANING	Vệ sinh	Dịch vụ vệ sinh container	2025-10-09 07:30:07.34	2025-10-09 07:42:47.943
1662295e-9fc2-4398-8f09-80ff97a94040	CERTIFICATION	Chứng nhận	Dịch vụ chứng nhận container	2025-10-09 07:30:07.34	2025-10-09 07:42:47.944
5dc16769-3e00-4b50-b2c9-c94e368def62	FUMIGATION	Xông hơi khử trùng	Dịch vụ xông hơi khử trùng container	2025-10-09 07:30:07.34	2025-10-09 07:42:47.945
53afbb5a-b7f6-4a52-bd1a-fbc31f8c2771	SURVEY	Khảo sát	Dịch vụ khảo sát container	2025-10-09 07:30:07.34	2025-10-09 07:42:47.946
\.


--
-- Data for Name: md_sla_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_sla_codes (id, code, name, description, created_at, updated_at) FROM stdin;
95084f94-c3f8-4f63-91be-f8b7b5860760	RESPONSE_TIME	Thời gian phản hồi	SLA cho thời gian phản hồi	2025-10-09 07:53:14.56	2025-10-09 07:53:14.559
efb75a32-5ad2-4b0c-bc2f-7269f2a3cc19	DELIVERY_TIME	Thời gian giao hàng	SLA cho thời gian giao hàng	2025-10-09 07:53:14.56	2025-10-09 07:53:14.559
7ad48ee2-ab59-4bf5-8a67-4ae77fbeb84d	INSPECTION_TIME	Thời gian giám định	SLA cho thời gian hoàn thành giám định	2025-10-09 07:53:14.56	2025-10-09 07:53:14.559
c026c52e-0537-459d-9be8-5787b3eb4eeb	REPAIR_TIME	Thời gian sửa chữa	SLA cho thời gian hoàn thành sửa chữa	2025-10-09 07:53:14.56	2025-10-09 07:53:14.559
fbd774e3-c81e-4012-97dc-d5e1dbb0410b	QUOTE_TIME	Thời gian báo giá	SLA cho thời gian gửi báo giá	2025-10-09 07:53:14.56	2025-10-09 07:53:14.559
3c7a08f1-cd71-4ce9-ba92-cdedf1cfa766	PAYMENT_TIME	Thời gian thanh toán	SLA cho thời gian xử lý thanh toán	2025-10-09 07:53:14.56	2025-10-09 07:53:14.559
\.


--
-- Data for Name: md_tax_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_tax_codes (id, code, name, description, created_at, updated_at) FROM stdin;
3f4ad3ba-2d05-4c3f-aa71-90f5a96c0b72	VAT_10	VAT 10%	Thuế giá trị gia tăng 10%	2025-10-09 07:53:14.567	2025-10-09 07:53:14.565
17fad119-f0c4-4bad-aeeb-95daf7a6db5d	VAT_8	VAT 8%	Thuế giá trị gia tăng 8%	2025-10-09 07:53:14.567	2025-10-09 07:53:14.565
efd4c88f-42d0-47b2-bbc3-ffca3e020cf3	VAT_5	VAT 5%	Thuế giá trị gia tăng 5%	2025-10-09 07:53:14.567	2025-10-09 07:53:14.565
298f0bde-0d67-470e-a595-01be7eacf160	VAT_0	VAT 0%	Miễn thuế VAT	2025-10-09 07:53:14.567	2025-10-09 07:53:14.565
0680113c-a1af-49db-a7e4-b90f1cb18a51	EXPORT_TAX	Thuế xuất khẩu	Thuế áp dụng cho xuất khẩu	2025-10-09 07:53:14.567	2025-10-09 07:53:14.565
72cac153-8443-46f4-936f-954616f21669	IMPORT_TAX	Thuế nhập khẩu	Thuế áp dụng cho nhập khẩu	2025-10-09 07:53:14.567	2025-10-09 07:53:14.565
\.


--
-- Data for Name: md_template_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_template_codes (id, code, name, description, created_at, updated_at) FROM stdin;
1c63a6b8-b2ac-4b21-bb31-c71086d941a2	EMAIL_WELCOME	Email chào mừng	Template email chào mừng user mới	2025-10-09 07:53:14.572	2025-10-09 07:53:14.571
7f739cac-f2ac-475a-8513-e48cee903b43	EMAIL_RESET_PASSWORD	Email reset mật khẩu	Template email reset mật khẩu	2025-10-09 07:53:14.572	2025-10-09 07:53:14.571
c59d0f1d-eece-4a3c-b19f-27c65da80835	EMAIL_ORDER_CONFIRM	Email xác nhận đơn hàng	Template email xác nhận đơn hàng	2025-10-09 07:53:14.572	2025-10-09 07:53:14.571
153d3b34-eec2-43bc-b44b-e68647291c40	SMS_OTP	SMS OTP	Template SMS gửi mã OTP	2025-10-09 07:53:14.572	2025-10-09 07:53:14.571
835d45d1-c829-4539-a230-6e7e473a5574	NOTIFICATION_NEW_MESSAGE	Thông báo tin nhắn mới	Template thông báo tin nhắn mới	2025-10-09 07:53:14.572	2025-10-09 07:53:14.571
c801cb87-4499-4735-a8bb-f12225c7b09d	NOTIFICATION_PAYMENT	Thông báo thanh toán	Template thông báo thanh toán thành công	2025-10-09 07:53:14.572	2025-10-09 07:53:14.571
\.


--
-- Data for Name: md_units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_units (id, code, name, description, created_at, updated_at) FROM stdin;
2ef4aa56-38aa-4463-9230-9bde4c880f05	TEU	Twenty-foot Equivalent Unit	Đơn vị container 20 feet	2025-10-09 07:51:30.609	2025-10-09 07:51:30.607
227e84cf-0c38-40a0-83d5-c6aa3b31f372	FEU	Forty-foot Equivalent Unit	Đơn vị container 40 feet	2025-10-09 07:51:30.609	2025-10-09 07:51:30.607
45d6722b-765b-4534-83a8-7073fa073b92	KG	Kilogram	Kilogram	2025-10-09 07:51:30.609	2025-10-09 07:51:30.607
cb684a9e-915f-40ed-9f88-0abafc5d7557	TON	Tấn	Tấn (1000kg)	2025-10-09 07:51:30.609	2025-10-09 07:51:30.607
c4fa8119-9cf1-497b-9843-a4d30891422d	CBM	Cubic Meter	Mét khối	2025-10-09 07:51:30.609	2025-10-09 07:51:30.607
eb07db1a-9d73-4441-81ae-7068f6630aba	DAY	Ngày	Đơn vị thời gian - ngày	2025-10-09 07:51:30.609	2025-10-09 07:51:30.607
bbf6c922-e9fb-489f-af45-15eb7b1abb0d	MONTH	Tháng	Đơn vị thời gian - tháng	2025-10-09 07:51:30.609	2025-10-09 07:51:30.607
95ab1d99-bfb3-453d-a39e-e706c74054cd	YEAR	Năm	Đơn vị thời gian - năm	2025-10-09 07:51:30.609	2025-10-09 07:51:30.607
0a87873c-75c4-48d9-9712-0b8cb5157894	TRIP	Chuyến	Đơn vị chuyến đi	2025-10-09 07:51:30.609	2025-10-09 07:51:30.607
ff8cdcb2-cfad-4f48-9ae0-febb429f9f4a	HOUR	Giờ	Đơn vị thời gian - giờ	2025-10-09 07:51:30.609	2025-10-09 07:51:30.607
\.


--
-- Data for Name: md_unlocodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_unlocodes (id, code, name, country_code, created_at, updated_at) FROM stdin;
e4d03f87-6873-4337-8ff5-bcb1d9ce6237	VNSGN	Ho Chi Minh City	VN	2025-10-09 07:51:30.491	2025-10-09 07:51:30.487
311187ba-800d-4c03-97a6-698ca08f139a	VNHAN	Hanoi	VN	2025-10-09 07:51:30.491	2025-10-09 07:51:30.487
80d940e9-ca1b-4174-93b7-dea89ab78319	VNHPH	Hai Phong	VN	2025-10-09 07:51:30.491	2025-10-09 07:51:30.487
da5320b5-1ebf-4713-b612-26701dc04530	VNDAD	Da Nang	VN	2025-10-09 07:51:30.491	2025-10-09 07:51:30.487
08afa014-39ff-427e-9a30-cbcd5779fd0e	VNQNH	Quy Nhon	VN	2025-10-09 07:51:30.491	2025-10-09 07:51:30.487
22c049f1-7e4b-47da-a38c-0dbe86564b14	VNVUT	Vung Tau	VN	2025-10-09 07:51:30.491	2025-10-09 07:51:30.487
a0d15533-6eb6-4d1b-85b3-2977388aff09	VNCAN	Can Tho	VN	2025-10-09 07:51:30.491	2025-10-09 07:51:30.487
2c9c9812-fccd-4d64-994a-874bef103f84	VNPHU	Phu My	VN	2025-10-09 07:51:30.491	2025-10-09 07:51:30.487
c96be274-2e4a-4c16-ac7a-616122b2ab24	SGSIN	Singapore	SG	2025-10-09 07:51:30.491	2025-10-09 07:51:30.487
ec56b443-7e76-435b-94d6-b9b26c4016f1	HKHKG	Hong Kong	HK	2025-10-09 07:51:30.491	2025-10-09 07:51:30.487
\.


--
-- Data for Name: md_violation_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.md_violation_codes (id, code, name, description, created_at, updated_at) FROM stdin;
545976e4-b03d-4dd8-bb33-73d9db1ddc58	SPAM	Spam	Đăng tin spam, lặp lại	2025-10-09 07:53:14.578	2025-10-09 07:53:14.577
ca98fee0-da43-43ca-b71c-57da95a66efc	FAKE_INFO	Thông tin giả	Cung cấp thông tin không chính xác	2025-10-09 07:53:14.578	2025-10-09 07:53:14.577
2552065e-7035-49c3-8e0d-616e38ac9aa3	INAPPROPRIATE_CONTENT	Nội dung không phù hợp	Nội dung không phù hợp với chính sách	2025-10-09 07:53:14.578	2025-10-09 07:53:14.577
40ff155f-2985-4e15-a0f5-2ba1e89b6cb9	PRICE_MANIPULATION	Thao túng giá	Thao túng giá cả bất hợp lý	2025-10-09 07:53:14.578	2025-10-09 07:53:14.577
9da2fa36-f12d-46a0-bae3-7124d6b5c3db	CONTACT_INFO_SHARING	Chia sẻ thông tin liên hệ	Chia sẻ thông tin liên hệ trái phép	2025-10-09 07:53:14.578	2025-10-09 07:53:14.577
85452ad4-5f32-40cd-95cc-40b1c027b54c	HARASSMENT	Quấy rối	Quấy rối người dùng khác	2025-10-09 07:53:14.578	2025-10-09 07:53:14.577
1c1a8089-b432-42a6-85b7-19f7ef1601fe	COPYRIGHT	Vi phạm bản quyền	Sử dụng hình ảnh, nội dung không có bản quyền	2025-10-09 07:53:14.578	2025-10-09 07:53:14.577
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, content, attachments, is_read, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_templates (id, channel, template_code, locale, subject, body_md, variables_json, version, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, data, read, created_at, updated_at) FROM stdin;
NOTIF-1760945633554-test	user-seller	rfq_received	TEST: Yêu cầu báo giá mới	Đây là notification test với JSONB fix	{"rfqId": "test-rfq-id", "purpose": "PURCHASE", "quantity": 10, "listingId": "test-listing-id"}	f	2025-10-20 14:33:53.557155	2025-10-20 14:33:53.557155
NOTIF-1760949274447-ller	user-seller	order_created	💼 Nhận được RFQ mới!	Bạn nhận được yêu cầu báo giá mới từ Người mua container cho tin đăng "Container 45ft DRY - Đạt chuẩn vận chuyển".	{"rfqId": "154aff95-b692-4ef5-82df-de703e3ced7e", "action": "rfq_received", "actionUrl": "/seller/rfqs/154aff95-b692-4ef5-82df-de703e3ced7e", "buyerName": "Người mua container", "listingId": "00dc48ed-5625-44ad-b600-038f569da9d7"}	f	2025-10-20 15:34:34.449466	2025-10-20 15:34:34.449466
NOTIF-1760951491716-ller	user-seller	rfq_received	Yêu cầu báo giá mới	Người mua container đã gửi yêu cầu báo giá cho Container 40ft FR - Đạt chuẩn vận chuyển	{"rfqId": "36eeea65-c5ad-47e5-9452-57d1db810e0f", "purpose": "PURCHASE", "quantity": 70, "buyerName": "Người mua container", "listingId": "136b5be7-fff8-4c95-b746-796b3128ada4"}	f	2025-10-20 16:11:31.718907	2025-10-20 16:11:31.718907
NOTIF-1760953511270-ller	user-seller	payment_received	Đã nhận thanh toán mới!	Buyer đã thanh toán 3.740.000.000 VND cho đơn hàng #28EE58DD. Tiền đã được giữ trong escrow.	{"amount": "3740000000", "orderId": "6ce9b8c2-2c54-479a-8f2e-831c28ee58dd", "currency": "VND", "paymentId": "PAY-1760953511189-58dd"}	f	2025-10-20 16:45:11.272084	2025-10-20 16:45:11.272084
NOTIF-1761028546543-uyer	user-buyer	container_ready	Container sẵn sàng!	Container của bạn đã sẵn sàng. Vui lòng sắp xếp vận chuyển.	{"orderId": "b0a8e8d1-624d-4f38-9cef-419d5ad49be2", "pickupContact": {"name": "Thái Dương", "email": "caothaiduong18092404@gmail.com", "phone": "+84344964979"}, "pickupLocation": {"lat": "", "lng": "", "city": "Hồ Chí Minh", "address": "Khu vực cảng Sài Gòn, Quận 4, TP.HCM", "country": "Vietnam", "postalCode": ""}, "pickupTimeWindow": {"to": "2025-10-25T13:35", "from": "2025-10-23T13:35"}, "pickupInstructions": null}	f	2025-10-21 13:35:46.545651	2025-10-21 13:35:46.545651
NOTIF-1761029970922-uyer	user-buyer	container_ready	Container sẵn sàng!	Container của bạn đã sẵn sàng. Vui lòng sắp xếp vận chuyển.	{"orderId": "6ce9b8c2-2c54-479a-8f2e-831c28ee58dd", "pickupContact": {"name": "cao thai duong", "email": "caothai@gmail.com", "phone": "344964979"}, "pickupLocation": {"lat": "", "lng": "", "city": "QUANG NGAI", "address": "Khu công nghiệp Đình Vũ, Hải Phong", "country": "", "postalCode": ""}, "pickupTimeWindow": {"to": "2025-10-31T13:59", "from": "2025-10-30T13:59"}, "pickupInstructions": null}	f	2025-10-21 13:59:30.924626	2025-10-21 13:59:30.924626
NOTIF-1761032104348-ller	user-seller	payment_received	Đã nhận thanh toán mới!	Buyer đã thanh toán 1.848.000.000 VND cho đơn hàng #8A75DBCD. Tiền đã được giữ trong escrow.	{"amount": "1848000000", "orderId": "72682c91-7499-4f0c-85a6-b2f78a75dbcd", "currency": "VND", "paymentId": "PAY-1761032104318-dbcd"}	f	2025-10-21 14:35:04.351996	2025-10-21 14:35:04.351996
NOTIF-1761032117353-ller	user-seller	payment_received	Đã nhận thanh toán mới!	Buyer đã thanh toán 528.000.000 VND cho đơn hàng #26677FEC. Tiền đã được giữ trong escrow.	{"amount": "528000000", "orderId": "745201cf-581b-4b4f-a173-718226677fec", "currency": "VND", "paymentId": "PAY-1761032117337-7fec"}	f	2025-10-21 14:35:17.354958	2025-10-21 14:35:17.354958
NOTIF-1761033250415-ller	user-seller	payment_received	Đã nhận thanh toán mới!	Buyer đã thanh toán 99.000.000 USD cho đơn hàng #9E401BCC. Tiền đã được giữ trong escrow.	{"amount": "99000000", "orderId": "c5b70504-95ff-43cd-89bd-15589e401bcc", "currency": "USD", "paymentId": "PAY-1761033250398-1bcc"}	f	2025-10-21 14:54:10.419654	2025-10-21 14:54:10.419654
NOTIF-1761033279580-ller	user-seller	payment_received	Đã nhận thanh toán mới!	Buyer đã thanh toán 297.000.000 USD cho đơn hàng #3B1F7C1A. Tiền đã được giữ trong escrow.	{"amount": "297000000", "orderId": "87937cd4-cd5c-45a2-b285-995d3b1f7c1a", "currency": "USD", "paymentId": "PAY-1761033279574-7c1a"}	f	2025-10-21 14:54:39.582098	2025-10-21 14:54:39.582098
NOTIF-1761033321548-ller	user-seller	payment_received	Đã nhận thanh toán mới!	Buyer đã thanh toán 600.000.000 USD cho đơn hàng #EHWCE3K0. Tiền đã được giữ trong escrow.	{"amount": "600000000", "orderId": "order-1760580381640-oehwce3k0", "currency": "USD", "paymentId": "PAY-1761033321541-e3k0"}	f	2025-10-21 14:55:21.549699	2025-10-21 14:55:21.549699
NOTIF-1761037933588-uyer	user-buyer	payment_verified	Thanh toán đã được xác nhận	Seller đã xác nhận nhận được thanh toán 1.848.000.000 VND cho đơn hàng #8A75DBCD. Seller sẽ bắt đầu chuẩn bị hàng.	{}	f	2025-10-21 16:12:13.614806	2025-10-21 16:12:13.614806
NOTIF-1761038822105-uyer	user-buyer	preparation_started	Seller đang chuẩn bị hàng	Seller đã bắt đầu chuẩn bị container của bạn, dự kiến sẵn sàng vào 23/10/2025.	{"orderId": "72682c91-7499-4f0c-85a6-b2f78a75dbcd", "preparationNotes": "đã kiểm tra ", "estimatedReadyDate": "2025-10-23T00:00:00.000Z"}	f	2025-10-21 16:27:02.106817	2025-10-21 16:27:02.106817
NOTIF-1761038846949-uyer	user-buyer	container_ready	Container sẵn sàng!	Container của bạn đã sẵn sàng. Vui lòng sắp xếp vận chuyển.	{"orderId": "72682c91-7499-4f0c-85a6-b2f78a75dbcd", "pickupContact": {"name": "Thái Dương", "email": "caothaiduong@gmail.com", "phone": "+84344964979"}, "pickupLocation": {"lat": "", "lng": "", "city": "Hồ Chí Minh", "address": "Khu vực cảng Sài Gòn, Quận 4, TP.HCM", "country": "Vietnam", "postalCode": ""}, "pickupTimeWindow": {"to": "2025-10-24T16:27", "from": "2025-10-23T16:27"}, "pickupInstructions": "ok"}	f	2025-10-21 16:27:26.950322	2025-10-21 16:27:26.950322
NOTIF-1761101653826-uyer	user-buyer	preparation_started	Seller đang chuẩn bị hàng	Seller đã bắt đầu chuẩn bị container của bạn, dự kiến sẵn sàng vào 24/10/2025.	{"orderId": "745201cf-581b-4b4f-a173-718226677fec", "preparationNotes": "ok", "estimatedReadyDate": "2025-10-24T00:00:00.000Z"}	f	2025-10-22 09:54:13.848057	2025-10-22 09:54:13.848057
NOTIF-1761101752532-uyer	user-buyer	container_ready	Container sẵn sàng!	Container của bạn đã sẵn sàng. Vui lòng sắp xếp vận chuyển.	{"orderId": "745201cf-581b-4b4f-a173-718226677fec", "pickupContact": {"name": "Thái Dương", "email": "caothaiduong18092404@gmail.com", "phone": "+84344964979"}, "pickupLocation": {"lat": "", "lng": "", "city": "Hồ Chí Minh", "address": "Khu công nghiệp Đình Vũ, Hải Phong", "country": "Vietnam", "postalCode": ""}, "pickupTimeWindow": {"to": "2025-10-29T09:55", "from": "2025-10-24T09:55"}, "pickupInstructions": null}	f	2025-10-22 09:55:52.534492	2025-10-22 09:55:52.534492
7a475ece-1f78-4079-b9b9-a016ffd6dc57	user-seller	transportation_booked	Vận chuyển đã được đặt	Buyer đã đặt vận chuyển cho đơn hàng #ORD-1760942564960-CXWVX. Ngày giao: 25/10/2025	{"order_id": "745201cf-581b-4b4f-a173-718226677fec", "delivery_date": "2025-10-25", "delivery_method": "seller_delivers"}	f	2025-10-22 02:56:32.969	2025-10-22 02:56:32.969
NOTIF-1761196486983-ller	user-seller	delivery_completed	Giao hàng thành công	Container đã được giao cho buyer. Chờ buyer xác nhận để hoàn tất thanh toán.	{"orderId": "a4d89d1a-d4de-4d09-9cb7-2360ad985799", "deliveredAt": "2025-10-24T05:06"}	f	2025-10-23 12:14:46.985992	2025-10-23 12:14:46.985992
NOTIF-1761102983978-uyer	user-buyer	container_ready	Container sẵn sàng!	Container của bạn đã sẵn sàng. Vui lòng sắp xếp vận chuyển.	{"orderId": "a0a42cff-2996-4c53-a8fc-f062f11f8130", "pickupContact": {"name": "cao thai duong", "email": "caothaiduong18092404@gmail.com", "phone": "344964979"}, "pickupLocation": {"lat": "", "lng": "", "city": "QUANG NGAI", "address": "Khu công nghiệp Trà Nóc, Cần Thơ", "country": "", "postalCode": ""}, "pickupTimeWindow": {"to": "2025-10-29T10:16", "from": "2025-10-24T10:16"}, "pickupInstructions": null}	f	2025-10-22 10:16:23.980491	2025-10-22 10:16:23.980491
06dbfb24-bb5d-4657-9e99-35f77e3e7c75	user-seller	transportation_booked	Vận chuyển đã được đặt	Buyer đã đặt vận chuyển cho đơn hàng #ORD-1760587932428-JK221. Ngày giao: 23/10/2025	{"order_id": "a0a42cff-2996-4c53-a8fc-f062f11f8130", "delivery_date": "2025-10-23", "delivery_method": "seller_delivers"}	f	2025-10-22 03:16:58.032	2025-10-22 03:16:58.032
NOTIF-1761105537655-uyer	user-buyer	delivery_started	Đơn hàng đang được vận chuyển!	Đơn hàng ORD-1760942564960-CXWVX đã bắt đầu vận chuyển. Mã vận đơn: 12913	{"orderId": "745201cf-581b-4b4f-a173-718226677fec", "carrierName": "xv", "trackingNumber": "12913", "estimatedDelivery": "2025-10-24"}	f	2025-10-22 10:58:57.657953	2025-10-22 10:58:57.657953
NOTIF-1761105948554-uyer	user-buyer	delivery_update	Cập nhật trạng thái vận chuyển	Cập nhật vận chuyển đơn hàng ORD-1760942564960-CXWVX\n📍 Vị trí hiện tại: Hồ Chi Minh\n✓ Đã qua: Thủ Đức\n⏰ Dự kiến giao: 11:05:00 24/10/2025	{"eta": "2025-10-24T11:05", "orderId": "745201cf-581b-4b4f-a173-718226677fec", "location": "Hồ Chi Minh", "checkpoint": "Thủ Đức"}	f	2025-10-22 11:05:48.556611	2025-10-22 11:05:48.556611
NOTIF-1761107792840-uyer	user-buyer	container_delivered	Container đã được giao!	Container đã được giao đến địa chỉ của bạn. Vui lòng kiểm tra và xác nhận trong vòng 7 ngày.	{"eirData": null, "orderId": "745201cf-581b-4b4f-a173-718226677fec", "deliveredAt": "2025-10-22T04:36"}	f	2025-10-22 11:36:32.842499	2025-10-22 11:36:32.842499
NOTIF-1761107792846-ller	user-seller	delivery_completed	Giao hàng thành công	Container đã được giao cho buyer. Chờ buyer xác nhận để hoàn tất thanh toán.	{"orderId": "745201cf-581b-4b4f-a173-718226677fec", "deliveredAt": "2025-10-22T04:36"}	f	2025-10-22 11:36:32.847988	2025-10-22 11:36:32.847988
NOTIF-1761108591757-uyer	user-buyer	container_delivered	Container đã được giao!	Container đã được giao đến địa chỉ của bạn. Vui lòng kiểm tra và xác nhận trong vòng 7 ngày.	{"eirData": null, "orderId": "72682c91-7499-4f0c-85a6-b2f78a75dbcd", "deliveredAt": "2025-10-22T04:49"}	f	2025-10-22 11:49:51.758929	2025-10-22 11:49:51.758929
NOTIF-1761108591763-ller	user-seller	delivery_completed	Giao hàng thành công	Container đã được giao cho buyer. Chờ buyer xác nhận để hoàn tất thanh toán.	{"orderId": "72682c91-7499-4f0c-85a6-b2f78a75dbcd", "deliveredAt": "2025-10-22T04:49"}	f	2025-10-22 11:49:51.763985	2025-10-22 11:49:51.763985
NOTIF-1761109206491-uyer	user-buyer	container_delivered	Container đã được giao!	Container đã được giao đến địa chỉ của bạn. Vui lòng kiểm tra và xác nhận trong vòng 7 ngày.	{"eirData": null, "orderId": "6ce9b8c2-2c54-479a-8f2e-831c28ee58dd", "deliveredAt": "2025-10-23T04:59"}	f	2025-10-22 12:00:06.492897	2025-10-22 12:00:06.492897
NOTIF-1761109206499-ller	user-seller	delivery_completed	Giao hàng thành công	Container đã được giao cho buyer. Chờ buyer xác nhận để hoàn tất thanh toán.	{"orderId": "6ce9b8c2-2c54-479a-8f2e-831c28ee58dd", "deliveredAt": "2025-10-23T04:59"}	f	2025-10-22 12:00:06.499947	2025-10-22 12:00:06.499947
NOTIF-1761114910174-ller	user-seller	order_completed	🎉 Đơn hàng hoàn tất!	Buyer đã xác nhận nhận hàng cho đơn #72682c91. Hàng trong tình trạng tốt.	{"notes": "", "orderId": "72682c91-7499-4f0c-85a6-b2f78a75dbcd", "condition": "GOOD", "receivedBy": "ttttt"}	f	2025-10-22 13:35:10.176744	2025-10-22 13:35:10.176744
NOTIF-1761114910182-uyer	user-buyer	receipt_confirmed	Xác nhận nhận hàng thành công	Bạn đã xác nhận nhận hàng cho đơn #72682c91. Cảm ơn bạn đã sử dụng dịch vụ!	{"orderId": "72682c91-7499-4f0c-85a6-b2f78a75dbcd", "condition": "GOOD"}	f	2025-10-22 13:35:10.183804	2025-10-22 13:35:10.183804
NOTIF-1761117544105-ller	user-seller	delivery_issue_reported	⚠️ Buyer báo cáo vấn đề	Buyer báo cáo hàng hư hỏng nghiêm trọng cho đơn #6ce9b8c2. Admin sẽ xem xét.	{"notes": "không dúng như yêu cầu", "photos": ["data:image/png;base64,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gAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAODyeO4AAACHiiIGLo/nDgDA/tjKezG4LJ44cPk8fwAArj0BAFwmTxy4PJ47AP8/e/ceZWdd33v8nc0wjEOIMcYQYggQIAYEBERFRKRo0XptrRdqW/F+rVqP1dYue9pzeqytVbu89dTjsT3W3uzNS7VWkXq34A1E7iCEGEKMIYQwTIbJZOf88ZlZIWSS7D2z9/49z97v11rPGuCv32LmeZ7v8/19f9+vJJVjLCbNgTeONDdmniVJksowDpPmyBtHmhtfPJIkSWUYh0lz5I0jzc0Q3j+SJEklNEgsJqlNfsBI7WsAw3j/SJIklTCTADAWk9rkTaNWNUsvoGKGMPMsSZJUghUA0hyZAFCrpkovoGLMOkuSJJUxRKoxtYebdWqJHzBqRRMfKg80jJlnSZKkEkwA7MtYXS0xAaBW+VDZm0cAJEmSyjAO25cbdmqJCQC1yofK3qwAkCRJKsMKgL018biuWmQCQK3y439vvngkSZJ6rwGM4EbMAxmrqyUmANQqHyp7GwJG8eUjSZLUSyYAZmesrpaYAFCrLCva2xB5+XgPSZIk9U4DN2FmYwJALfHjRa26r/QCKmYIWIj3kCRJUi+ZAJidsbpa4seLWjWJmcX7m0kA+PKRJEnqHWOwfTVJrC4dlAkAtcKHyr5megB4D0mSJPWOFQCzc7NOLfHjRa2yB8DehoDD8R6SJEnqpQaJwUwA7M3NOrXEjxe1agKzivc3DCzGl48kSVIvDZEYzHHMezRJrC4dlAkAtcqs4t48fyZJktR7xmCzM1ZXS0wAqBUzWUUrAPbmy0eSJKm3ZhIA2sNYXS0zAaBWjZdeQAUtxPIzSZKkXhrGBMBsjNXVEhMAatU4NgJ8oFF8AUmSJPXSQoy/HqiJCQC1yASAWuVDZV+LcBSgJElSr8yMADQBsDcTAGqZHy5q1QRWADzQYpIEkCRJUm8sIjGY9pjCKQBqkQkAtWoSM4sPtAgTAJIkSb1k/LUvN+rUMhMAatUUJgAeaJS8gLyPJEmSuq/BniOY2mMcxwCqRX64qFVWAOxrCFiK95EkSVIvNEjs5RjmvY1hBYBa5IeLWjUFbC+9iAo6Cu8jSZKkXmiQ2Et7244VAGqRHy5q1SQmAB6oAazALLQkSVIvDJHYy2+YvY1hAkAt8uZRq0wAzG4lMFx6EZIkSQNgmMRe2ts2TACoRSYA1KpJkl3U3pYBI6UXIUmSNABGSOylvVkBoJaZAFCrrACY3ULSjEaSJEndtZTEXtqbCQC1zASAWtUE7i69iAoaIWfRJEmS1F0rsPJyNneTWF06KBMAasd2HDHyQCPAqtKLkCRJGgCrMAHwQFOkB4DUEhMAaocNRvY1AhxdehGSJEkD4GhMADzQJCYA1AYTAGrHVmC89CIqyEkAkiRJ3eUEgNmNkxhdaokJALVjGzBRehEVtAxYVHoRkiRJfWwRTgCYzQRWAKgNJgDUDhMAs1uBkwAkSZK6aSk2Xp7NBFYAqA0mANQOEwCzW44JAEmSpG5aSmIu7c0KALXFBIDaMUYmAWhvC/FMmiRJUjetJDGX9rYNe3SpDSYA1I4pYHPpRVTQELAaGwFKkiR1wzCJtYZKL6SCNuOYbrXBBIDa0QQ2Tv/UHkPAiZgAkCRJ6oZhEmuZANibsbnaZgJA7WgCd+BD5oEawCosS5MkSeqGhSTW8ttlb8bmaps3kdq1CcuMHqgBLMHRNJIkSd2wnMRafrvszeO5aps3kdrRxHNG+7MIGwFKkiR1w0pgcelFVNBMAsAKALXMBIDatQ0nAczGSQCSJEndsQIYLb2ICtqOIwDVJhMAakeTPGgsNdrXKHAcvpwkSZI6aSHGWPuzmcTmVgCoZSYA1K4xTADMZhg4FlhaeB2SJEn9ZCmJsZy2tK/NJDaXWmYCQO0aA7aUXkQFDZEjACYAJEmSOmcpibEcAbivLZgAUJtMAKhdk+RhY6nR3hrkBbUc7ytJkqROaJDYainGVw8005x7svRCVC/eSGrXFPAzYLz0QipoMSlRGym8DkmSpH4wAqzCCQCzGQfuxOlcapMJALVrZtyICYB9LQKOwTNqkiRJnTBCGgAuKr2QChrH8dyaAxMAatcksBFHAc5mFFiNWWpJkqROWESqK50AsK9tJCb3CIDaYgJA7ZoiPQBMAMxuphGg95YkSdLcNYBl5AiA9jXTmNsKALXFjxTNxXZgKzYCnM0KbAQoSZI0XzMNAFeUXkgFNUks7oac2uZHiuZijJw5MgGwryXkGIB9ACRJkuZumJT/e7RyX01gE44A1ByYANBcjJGHjiVH+xoBHoln1SRJkuZjlMRUTlfa1xQmADRHJgA0F2PAHdh0ZDZDwFrsVitJkjQfi0hMNVR6IRU0CfwUEwCaAxMAmospnARwIKuANXh/SZIkzUWDxFI2AJzdNmADVuNqDvxA0Vw0SQJga+mFVNRy4GS8vyRJkuaiQWKp5aUXUlHbyBEA+3GpbX6gaK42YwJgf2b6ANgIUJIkqX3DwKl4/n9/tpJYXGqbCQDN1TacPXogp2PXWkmSpLlYDJxWehEVNYUbcZoHEwCaq3Fy9shGgLM7AVhZehGSJEk1tJLEUtrXBInBx0svRPVkAkBzNQHcNv1T+1pIqgAkSZLUntNJLKV9GYNrXkwAaK4mgHU4fmR/GsCTsA+AJElSO4ZJDOV3yuzGSQxuFa7mxBtL8+EkgANbi+NrJEmS2rGKxFDaV5PE3ptKL0T1ZQJA87GJJAEcQTK7ldjARpIkqR2nYR+lA9mACQDNgwkAzccW8hAyATC7hcApwGjphUiSJNXAKImdPP8/uyaJvbeUXojqywSA5mMc+DGOAtyfYeDRwNLSC5EkSaqBpSR2sofS7KZI7O0EAM2ZCQDN143YhXR/hoA12AdAkiSpFatI7DRUeiEVNQHcXHoRqjcTAJqvq4FtpRdRYUuBMzGTLUmSdCDDJGaycnL/tpHYW5ozEwCar83A+tKLqLBFwKnTPyVJkjQ7Y6aDW0dib2nOTABoviaAq0ovosI8BiBJknRwlv8f3FV4/l/zZAJA8zUJ/AgnAexPg4yyOQFfaJIkSbMZAlaTmMnvk9k1gWuw+bbmyRtMnXALsLX0IipsKfAoLGmTJEmazSLgDDz/fyBbsAGgOsAEgDphA/YBOJBFpKnN8tILkSRJqqDlJFZys2T/1pOYW5oXEwDqhI2YkTyYk4G1eAxAkiTp/oZIjHRy6YVUWJPE2ptKL0T1ZwJAnTAJXE8aAmp2y4FHAyOlFyJJklQhIyRGslJy/yaB66Z/SvNiAkCdMAX8ENheeiEVNgw8FlhSeiGSJEkVsoTESMOlF1Jh24GrsQGgOsAEgDphCueStmLmGIAkSZLiZCz/P5hNpOm2CQDNmwkAdYqdSQ9uKfAkvO8kSZIgMdETsfv/wThxSx3jh4g6ZRspTfJs0v4NA+fiS06SJAkSE52L5f8HMkli7G2lF6L+YAJAnTIB3ITZyYM5BcvcJEmSIDHRKaUXUXFbSYxts211hAkAdcoUKU9yPumBLQaejJluSZI02IZJTLS49EIqbgOe/1cHmQBQpzRJg5L1+IA6kAZwAbCi9EIkSZIKWkFiIr9H9m+m0fZGEmtL8+YNp07aCtwIjJdeSMWdQMbdSJIkDaqzSUyk/RsnTbY9/6+OMQGgTtoO3ACMlV5IxS0iHW8teZMkSYNoMYmFFpVeSMVtB66b/il1hAkAddIUqQCwTOnAhknWe23phUiSJBWwllRD2hNp/2aO196Mx2vVQSYA1Gnrpi8TAPvXAFYBZwEjhdciSZLUSyMkBlqF3yIH0iTN/9YVXof6jDedOm0rcC32ATiYxcDjyPxbSZKkQbGUxEAehTywceB6YEvphai/mABQp00C38c+AAczDJwGrMH7UJIkDYYGiX1Ow/L/gxkjMbXl/+ooPzzUaU1yVmlD6YXUwMwxgNHSC5EkSeqBheTs/6rSC6mBDSSm9litOsoEgLphI3AVPrAOZhHwJDIHV5Ikqd8tx+7/rWiSWHpj6YWo/5gAUDdsAy4nxwG0fw3gTDIRwDI4SZLUz2amIJ2J3yAHM0Fi6W2lF6L+482nbrmSjC7RgS0DnoyZcEmS1N8WkZhnWemF1MBmEktLHWcCQN1yPTm3pANrAOeShjiSJEn9ag2Jefz+OLgbSSwtdZw3oLplDPg29gFoxSrgqaUXIUmS1EVPxeZ/rWgC38KJWuoSEwDqpm8A20svogaGgKeRxjiSJEn9ZgWJdYZKL6QGtpNNNKkrTACom24Gri29iJo4BTiv9CIkSZK64DwS6+jgrsVjtOoiEwDqpi3AZcBU6YXUwCjwHGyMI0mS+ssyEuOMll5IDUyR3f/NpRei/mUCQN00CVxBEgE6uHNwNI4kSeof9x95rIPbTGJnN8/UNX5oqJumgKuxjKlVy4BfwJGAkiSpPywCnoEVjq26hRwBMAGgrjEBoG5qAhtJEmCy8FrqYIRUAXhGTpIk9YNTyO7/SOmF1MAkcBWJnZ2ipa4xAaBu2wZ8d/qnDqwBrAbOxyoASZJUb4tITLMavzlasQ34PsbM6jJvRnXbFCllWld4HXWxGPg58rKUJEmqq9UkpllceiE1sQ7L/9UDJgDUbU3yQLsKjwG0ogGcBpyL3XIlSVI9jZJY5jT83mjFTPn/Oiz/V5d5Q6oXZo4BOA2gNUuAnwdWlF6IJEnSHKwgscyS0gupiS14ZFY9YgJAvTBBGgFuwKxmKxrAWdPXUOG1SJIktWOIPXGM3xoH1yQx8tUkZpa6yptSvXIzTgNoxzLgWcDS0guRJElqw1ISwzj6rzWTODZbPWQCQL0yU9o0XnohNTEEXACcWXohkiRJbTiTxDBWMbZmHLgcj8qqR0wA/MqrZAAAIABJREFUqFeawNdJiZNasxy4GJsBSpKkehglscvy0gupkQ3AN/GYrHrEBIB6aT1wGT7g2nEBcA7eq5IkqdoaJGa5oPRCaqQJfBvHZauH/KhQL40BX8BjAO1YArwQu+hKkqRqM2Zp3zjwRYyN1UMmANRrPwBuLL2IGmkA5wGPxftVkiRVU4PEKudhvNKO60lsLPWMN6h6bSM55zRVeiE1shJ4Bk4EkCRJ1bSUxCorSy+kRqZITLyx9EI0WEwAqNemgEuAbaUXUiOjJKN+Gt6zkiSpWhokRjkPGxe3YxuJid0UU0/5MaESfoDlTu1aDTwHZ+pKkqRqWUZilNWlF1IzPwCuLL0IDR4TACphJuNpw5PWjZKuumcBw4XXIkmSBIlJziIxirv/rRvDilgVYgJAJUwA3wFuLr2QmlkNPAt7AUiSpGpYSmITd//bczOJhSdKL0SDxwSASmgCtwDfAyYLr6VORoALSaZ9qPBaJEnSYBsiMcmFJEZRayZJ+f8tJCaWesoEgErZAnxr+qdatxJ4PrCo9EIkSdJAW0RiEjv/t8cYWEWZAFApE6Txyc2Y/WzHEPAU4NzSC5EkSQPtXBKTWJXYuiZwI4mBLf9XESYAVNLNwGXYDLBdy4GXYi8ASZJUxlLg5SQmUevGSexrHywVYwJAJY0BXwM2lF5IDZ1PztyZdZckSb00RGKQ80ovpIY2kNh3rPRCNLhMAKikJnA1cBU2A2zXIuBXgFWlFyJJkgbKKhKD2I+oPZOk9P9qPP6qgkwAqLRNwKXA9tILqZkG6bz7TJy7K0mSemMhiT3Owu+Idm0HvgJsLr0QDTZvXJU2CXwdWFd4HXW0FHgOcDLey5IkqbsawFoSe9iHqH3rSMxr1auK8qNBVXAz8NXSi6ihIeBM4OlYhidJkrprEYk5zsQeRHPxn9j8TxVgAkBVMAV8Ekui5mIx8EukFM+XsSRJ6oYhEmv8Mok91J7NJNadKr0QyQSAquJ6khm1KUr71pIX8rLSC5EkSX1pGYk11pReSA01SYx7Y+mFSGACQNUxBnwe2FJ6ITU0AjwNOAfvaUmS1FkNEmM8jcQcas8W4N9w9J8qwo8FVcllZCSgVQDtWwn8KjblkSRJnbWUxBgrSy+khppk9N9lpRcizTABoCrZCHwRGC+9kBoaAi4go3m8ryVJUic0SGxxAfYamosx4Atk7LVUCX4oqEomgG+SfgBq3yLg5aQngCRJ0nytJbGF04bm5nrg2yTGlSrhkNILkO5nN9n9PxI4Axguu5xaehj5//hdYEfhtUiSpPpaArwZeBbu/s/FGPC3wOcwJlOFWAGgqtkOfI3MSbUXQPtGyIze8/BlLUmS5maIxBJPx8Z/c9Eksew3sPmfKsYEgKpmCrga+A6WS83VKuCFwOrSC5EkSbW0msQSq0ovpKYmSCx7NYltpcowAaAq2gxcOv1T7RsBzgUuBBYWXoskSaqXhSSGOBd3/+dqC8ayqigTAKqiKdIw5SrMms7VCuD5wMl4n0uSpNY0SOzwfBJLqH1TZPTftzGOVQX5YaCq2gR8ivQEUPsawFnkBb648FokSVI9LCaxw1n4nTBX24HP4Og/VZQ3tqpqCvgyOT+luRkFLiJlfDYElCRJBzJEYoaLSAyhufkO8CXc/VdFmQBQlW0A/oWMBtTcrARei018JEnSga0iMcPK0gupsXESu24ovRBpf0wAqOq+TDqoau4eC1yMDQElSdLsFpJY4bGlF1JzV5PYVaosEwCquo2kF4AjAeduhJTznYdHASRJ0t6GSIxwEXb9n49xErNuLL0Q6UBMAKjqJrEKoBOOJZl9jwJIkqT7W0VihGMLr6PuZnb/J0svRDqQQ0ovQGrBGOlKexZwWOG11NUhwJHk/+UPgfvKLkeSJFXAIuBlwIuAIwqvpc62Ax8DvoAxlirOCgDVwRh7qgCahddSZ0uBFwLn4lEASZIG3RCJCV5IYgTNTZM9u/9jhdciHZQVAKqD3eSBeiRwOp5Pm48Hk/v+R8Bd5P+tJEkaLA3geOD1wBNxY2A+7gb+Bvh3YEfhtUgHZQWA6mI7cClwI1YBzMcImfH7izgVQJKkQbWQxAIX4sbKfDRJbPpVEqtKlWcCQHUxU171VSyvmq+lpNnP2aUXIkmSijibxAKW/s/PGPCfeExVkrqiQcbU/BDYRcrXveZ27QT+DVjW1m9AkiTV3TISAxhLze/aBVxB+ii4qarasAeA6mQ38FPSC+BxeF5tPhrAajKz9vs4skaSpEGwEHgD8HL8DpivHcD/BT4JTBVeiyT1tVNIFUDpzG8/XLcCzwWG2/oNSJKkuhkm7/xbKR9/9MN1BXByW78BqQLM/KmOtgNLgMdjFcB8jZIZwFcDm8kLTZIk9ZcG2UD5LeBR+A0wXxPAR9hzlEKqDc+rqI4mgE+Trquan2HgHDID2H4AkiT1p2XkXX82Vv11wvXAZ/EIpWrI7J/q6h4y0/5s4NDCa6m7w0hfhY3ATaRBoCRJ6g+jwLOAVwMrgAVll1N748BfAJ/Ds/+S1DMN4HTgW5Q/A9YP1y7gGyShYmWQJEn9oUHe7d/Arv+dur4GnIbxkmrKCgDV1W7SC+BQ4Czg8LLLqb0FwHLgIcDlwN1llyNJkjrgGOD3gQuwb1InbAL+HPhPLP9XTZkAUJ3tBMaAtcDxmImdr0OA44B7ge/iUQBJkupsFPgN4GJgpPBa+sEk2f3/GDk2KdWSH0yqu3XAF0gHe83fKJkN7E6BJEn1NUTe5S8h73bN32bg8yT2lGrLCgDV3U5yFGCmCsC/6fk7AngYGQ34U3LcQpIk1UODjPr7XdIvyaZ/8zcJXAr8XxIbSbXlx5L6wT3kb/nxZKa95mcBmQqwAPgBOWYhSZLq4UjgN4Fnkkk/mr87gA8D3ybNFKXaMgGgfrCLlGWtAU7Goy2dMExGBd0NXAfcV3Y5kiSpBYuAXyfH+R5aeC39Ygr4NPARUnUqSaqIc4HbKD8epp+uG4CLsHmQJElVN0Le2TdQPn7op+tW4Jw2fg9SpVkBoH6yGTgaeDRWAXTKg4GlwLWk4+3ussuRJEmzaACPAd5Gzv8bB3XGJPAJ4G9IJYBUeyYA1E+mgK3AE4BlhdfSLxrAUaSD8PfJkQBJklQtRwNvBZ5KjvGpM34EvBNYX3ohUqeYAFC/uRs4nGTBbXzTGUPAMcAE8F0yeUGSJFXDKPA6MvJvYdml9JVt5Nz/v5NKAKkvmABQv5mpAngkcByOvumUETJm8VbgRqBZdjmSJIkk6Z8F/A7p/q/OaAJfAz5IJgB4BFJ9wwSA+s1u0qF1iFQBHFF2OX3lCFIJcA1wO74MJUkqqQE8DvgD4CTc9OikO4APAV/Hykf1GRMA6kdTwBZgFbCWJAM0fwtIb4XlZDTgZkwCSJJUQgM4DXgH8ESMdTppnIz9+yvgzsJrkTrOBID61b0kY3sm6WJvVrwzDiElhg2SBNiOSQBJknqpQTY5Xgs8m/Q+Umc0geuBDwNX4JFH9SETAOpXTVIFcCTJkNsQsHNGSLfhCTIecLzsciRJGigPJQ3/XgI8rOhK+s89wN8BnySbSVLfMQGgfraDdHB9NPlgVeccDhxLzshdgxlySZJ6YQh4LvBmYCVWOHba94H3ALeUXogkaW6GgdeQjO5ur45eu0h53Dkt/zYkSdJ8nEvevbsoHwf023UP8CoSO0qSamwJ8Bl8WXbj2gVcQpotNlr9hUiSpLY0yLv2UoxnuhXPfIrEjFJf8wiABsHMUYAnAQ8uvJZ+s4CUIB5BdiRmKi0kSVJnNMi79neBZ2LH/264Dfg9cqxR6msmADQotgAPAU7FhoCddgjpsbCbdM69p+xyJEnqK0cBrwZ+lSTc1VnbgY8B/0waHEt9zQSABsUkcBdwEhmdY7l6Z40AxwBjwI2k6kKSJM3PEuBF5Gz6cmz612lTwDeAD5IqAKsY1fdMAGhQ7CbHABrAmXgUoNMWAItIEuAO4CbyUpUkSXMzAjwHeBNwPG5edMMG4MPAV8lmkdT3TABokOwEtpKP1LV4hq7TFpBjFseQKgAz6ZIkzU0DeCI5938KxuzdMAH8G/CX5KioJKkPNYDzge9iF91udtL9FnAa7lZIktSuBnmHfgtjlW7GKpeTmNBYRQPFbKIGzW5gM9n9Pws4vOxy+tIC4OHAUuCHpPfC7qIrkiSpHhrACcDvAxfix2m3/Iyc+/8clv5rwJgA0CDaCdwOnAicjA11umEBOQpwKHAd6bBrEkCSpP1rkEbFbwRegFOLuqUJfBb4ADkaKg0UEwAaVGOkEuB8cm5dnTdMkgDgeEBJkg7mKNLt/9dJ9391x63A7wHX4uaEBpAJAA2q3cBPgYXAY8jHqjpvlCQBJkhjwPGyy5EkqZKWkg//VwArsDqxW8aADwH/RCpCpYFjAkCDbAr4CXASsKbwWvrVzHjA40nC5XocDyhJ0v2NAM8D/htJmnvuv3v+A3gP6QEgSRpAQ8DTgR9hp91uX7cCL8ZqC0mSZgyTd+OtlH9P9/O1i8R6T8Mx0BpwVgBo0DWBO0mp+qOmf6o7FgOPBG4A1pOXsSRJg2oYeArwTlIpp+65E/gY8Gng3sJrkYoyASDBfWRU3YnAcXhfdNNDSYfjm4A7MAkgSRpMw8DZZNzfGYXX0u8mgUuBj5ANiN1llyOV5YeOlBfBXaQZzJlkKoDNd7rnKGA5cAtJAjTLLkeSpJ4aIg2Ifxs4D+PxbmqSeOMDwDexD5HkA0eatos0qXsoSQIcWnY5fe0QYCXpeHwT+f9uNl6SNAga5MjhW4ELSQNAdc+9wMeBvyETACRJ2ssJwBcp36xmEK57gb8HTsaOx5Kk/tcg77y/J+/A0u/hQbi+SGI7SZL26zzgNsq/tAbhug/4JI5hlCT1vzXknXcf5d+/g3DdCpzb0m9GGiAeAZD2dQc5AnAm8KDCa+l3h5DOxw8GrgTuIS9tSZL6yUrgHcDzgMMKr2UQbCXn/v8Rew1JezEBIO1rF7CRdKt/BN4n3TZEJjAcClwDbC+7HEmSOmol8AbgJThuuBcmgM8AHybj/yTdjx820uzuAbYBp5KO9U4F6K5hUgmwG7iR/P+XJKnuVgCvAl4GLCm8lkHQBK4A3gf8EHf/pX2YAJBm1wS2kIY9pwNHlF3OQHgQexr13IDdeiVJ9bYceCXwCtxM6JU7gP8NfB7YUXgtUiWZAJD27z7yIlkBrMXRgN22AFhIOiTvBK4DxouuSJKkuVlKPvxfTz7+nXbTfePAPwMfBTYXXotUWSYApAO7G7gdOIX0BDB7310zSYBHkd4A15BRSZIk1cUy4I3k3P8yjB16oQl8E3gnqSKUtB8mAKSD+xmpBjgbWFR4LYNilFQCTABXT/+UJKnqFpOy/zeSKgD1xk+APwG+iuf+pQMyASAdXJO8WBaR0YAeBeiNmSTAOHAzHgeQJFXbUuDFwJuBIwuvZZCMA38BfAJjBemgTABIrZkAbiUfpMdjOV+vHAGsIf//b8SGPpKkaloCXEx2/o8uvJZBMgV8EfgjYFPhtUi1YAJAat09pKnMaaShj3rjwcCJwCRWAkiSqmcp+fh/PXAMbhL00pXk3P+VZJSwpIMwASC1rgn8lPQDOAP7AfTKAnKm8lQyHeAGTAJIkqphKfAy4E1k599u/72zHngv8O9kk0BSC0wASO2ZJP0AjgBOIrPr1X0LSMLlDJLhvw6nA0iSyloGvJac+V+OO/+9tBX4S+D/kYlNklpkAkBq3w7gDlLmt5qMq1NvjJJKgCYmASRJ5SwDXkNG/dntv7cmyLn/D5EqAEv/pTaYAJDat5tknu8GTsGsf6+NkuqLJukJcE/Z5UiSBswK4BXA60giQL3TBH4I/CnwXWBX2eVI9WMCQJqbJrBx+ucT8ChAry0k0wEOIdMBTAJIknphBfBq4JXT/6zeugt4N/A50pNJUptMAEhztxO4hQQAj8LGP702kwQYBq7HJIAkqbtWkE7/LwOOwuq/XpsCPg58EN/50pyZAJDmZwfZgT4ROA6TAL20gDRjfCSZEnATsA3PAkqSOqsBHA+8DXgJKfv347+3poD/AP6AVGBKklRMAzgfuJxUBez26vl1L9kVOAGTMJKkzmmQarOPk3dN6ffdIF47gf8isZbveGmerACQ5m83sJlUA5wCPAR3BnrtUOARZFfmZuBO0p9BkqS5GiJVZm8Hno/9fkpokgq/PwMuIeOYJc2DCQCpM3YCm8h59FOAw8suZyANkbGMRwK3AT/FJIAkaW6GgDOBtwLPJhNo1Hs/BT4GfJIc85M0TyYApM4ZBzaQxkBryK60emsYOBZ4OPAT9kxqkCSpVcPA48iZ/6eRprPqvXHgU8Cfk/f57rLLkfqDCQCpc3aT7PRGUgVwNB4FKGEYWAUcA9yKSQBJUuuGgMcDvwtcgBV9pTSBy4B3Adfie1ySVGENEjTcRPnGOYN87QK+DzwXGDngb0ySpLwrngtcQd4hpd9jg3zdAJyHTf+kjrMCQOq83eQM+iRwFpYOlrKAHMc4gzRpvA24r+iKJElVtQh4DvCHpPGfFXzlbAL+CPg07vxLHWcCQOqO3cA6Mp/+JNyBLumhJJgbJ7+T8aKrkSRVzVLgheTM/yMKr2XQbQX+ijT+u7fwWqS+ZAJA6p4J0oju4aQ7vU0By1lCgromcAswVnY5kqSKWA68GHg9cCLu/Jc0DnwW+BCJn3aXXY7Un0wASN2zG7iLjLA5gTQF9CxbGQuAh5AkwDBwM0kCGFxI0mBqkAT9q4FXAsfhO7qkSeCbwHuBH5IeDJK6wASA1F1NkgDYSiYDPAx3F0pZQM54nkKOZlyLM4UlaVAdA7wVeCmpAvDjv5wmcDXp+P91YGfZ5UiSNH/DwK8BP6Z8Z12vBBefB04jI58kSYNhiDz7P0/eBaXfR16JjV5EYiVJXWYFgNQbu8jZc8hkgAcVXIuy03M8sAa4nXQcdsdBkvrbKPBE4H8CP49xcBVsJWX/fwfsKLwWaSD44JN6ZxK4ETgSOBmbApa2AFhF+jNsBzaQxo2SpP6zGHgW8FvAuRgDV8EY8LfA+/FIntQzPvyk3hon8+iPIZMBvAfLagArgLUkQXMrjgmUpH6zFLgIeBNwBh79qoIJ4N+BPwbWF16LNFD8+JB6bytpDLiGfHzaeKisBmnOuJZUZVyPs4clqV8sI53+X0MmwRj7ljcFfBv4U+BK0gRQkqS+NgI8D7iG9Aco3YDHK7+Hu4CPkMSMJKneVpBn+l34rq3KtQv4EfCLJBaS1GNmQaUypoB1wD3sGUvneMCyFpBg5FGkQeB6YDPOIpakuhkGHgP8L1L6P4rv2CpoAjcD7wY+i03/pCJMAEjl7CRnzneRJMCissvRtJkJASeSXaNN2BxQkupiMfBU4HeAp2DD3Sq5HfgA8A9kA0RSASYApLImgJvIzvOZOAO3Kg4BHg6cRJoDrsPmgJJUdUuBFwC/SUbu+k6tju3kOMZHSS8kSYWYAJDKGydJgBVk19ndimo4hDQHPHn6n28iI4skSdWzHHgF8DrS7M93aXWMA/9Mmv5tKrwWaeCZAJCqYTs5F3c0SQI4GaAaGqSc9HSys3QtziqWpKo5Fng7SQCswPi2SiaBzwHvInGOJEmaNgScDVxC+gOU7tTrtfe1A/jU9O/IslJJKm8YOIc8m3dQ/j3htfe1E/gi8FgS40iqADOkUnU0SWncbcBq3MWomiHgBFINcDewEbiPBDmSpN5pAA8Bng38D+A8TMxWzSTwLTKJ4XIy/UhSBfhxIVXLTBLgHmAtsAxHF1VJAziSTG3YTUYFjmESQJJ6pUES5L8KvAl4JO4uV00TuJqc+f8KSQZIqggTAFL1TJEqgB1kJv3issvRAzRIc8BTgSOAH2NHY0nqleOBNwCvItVy9sypnluB9wCfxQk6UuWYAJCqaRK4hZSYPxZ4UNnlaBZHkDGBK8lxgE1k10OS1HlD5H3422TU38PKLkf7sQV4N/APpMGxpIoxASBV1wRwPRlldBowUnY5msUImdpwCukLsB5LHSWp0xYCzwR+D3jy9L+rerYCHwD+D07MkSrLBIBUbRPAdWTn42SsBKiiIVIF8Jjpf16HfQEkqRMawMPJeL/fJkevDi26Iu3PVuAvgA8DdxZei6QDMAEgVd8YcANwOOlCP1p2OZrFAtKR+ixgOXA7KYPcVXJRklRjw6T67W3AK4GjsCluVW0BPg58ELij8FokHYQJAKkexsjO8hKSBDis6Gq0PyOkL8Aa0hNgEx4JkKR2LQSeBPx34BlY8l9l24B/BD5EGhhb/SZVnAkAqR52k5fsbWQM3Qk49qiqhoBjSSJgF2kQeC8GRZJ0MA2y0/984C3AOVjyX2UTwKeB95OeRTbClWrABIBUH01gM5kOcBwZhWQ5ZDUtIEcBTiVHA24n5yMNjiRpdkMkcfo6UvK/Fkf8VdkU8CXgD4Gr8f0mSVLXDAFnA5eTXWWv6l67gLuAzwDnY9WGJM1miDwjP0Oembso//z2OvD1LTKW0SSNJEk9MBMsfQvYSflAwOvA1y7gGrKztRgDJkmCPAsXk2fjNfjhX4drJ/AN4DxMaku15BEAqZ6a5Gz5T8h586Pwfq6yBcDDgMcDR5CGjvfglABJg2sYWA38JjnvvwqPtVXdJPBfwP8CvkmSAZJqxg8Gqb52ARtIX4BjyZlz7+lqexAZa3UMsB34GWmiJEmDZDHp8v8W4CLgwWWXoxZMAt8B3g18Bbiv7HIkzZUfC1K9TZEqgM3AiTgnuQ6GyRSHk8kzeCOpBthdclGS1AMN4GjgV4A3kjLyBxVdkVrRBL4H/AlwKbCj7HIkzYcJAKn+dgLrSaf500mpuartEFKx8ShgBfn9bcYkgKT+1SAVUL8FvIQkrT1DXg/XAL9PPv7HC69FkiRNGyallD+mfJMgr9avHaSc8kIMhiX1pyHyjPsKeeaVfu56tX79GHgBiTEk9QErAKT+sQu4kVQCPBJ4KB4HqIMh0sPh54DDgNuAe3GmsqT6GwJWAq8l8+JPw0RnXTTJzv87yHjGybLLkdQpJgCk/rKLfEBuI+WVS3DkXF0sAs4gnbDvBLZgwCWpvhYCZ5OS/4uBI8suR22YIh//7wH+Dc/8S33FBIDUfybJmfLtZMTSQzEJUBcPAtYAa0n1xibye5SkOlkJPA94E/AUMv5U9TAFXAu8H/g0voOkvmMCQOpPO4BbyIv7EdgYsE5mSmYfTZI3PwG24pEASdU3RCacvAl4DXAScGjRFald1wLvA/4FuLvwWiR1gQkAqX9NkOY9PwPOwjnLdbKA7JitJQmcMWADHgmQVF0LgacDvwM8E1iKfWjq5hbgD4DP4s6/1LdMAEj97T7SGHALcCYmAermMOA4ksAZBtaRZMDugmuSpPtrAA8HXgG8jbxrHlR0RZqL9cDvAf+Mo/4kSaq9EeBFwA+BnZQfK+TV/nUP6cT8NLLTJkmlLSTPpM+QZ1Tp56RX+9dOEhtcRGIFSX3OCgBpMEyR4wB3AseTngA2BqyXYTLZ4THk2b2RVAPYG0BSrw2RiSUvBt4OPJ5ULKlepoCrgD8lSRy7/UsDwASANDh2khGBd5HpACYB6mcBOVd7JrCC7Lhtxt4AknpnIXAu8AbgZSQR4Fn/+pkCriQN/z5HEsqSBoAJAGmw3EfOkd9Jmss5l7meRsm4wEeydzXA7pKLktTXZs76X0S6/F+AfWXq7CrgT8jH/z2F1yKph0wASIPnPnIc4Kdk1NxDyi5Hc3QosBw4nVQD3E5+pyYBJHVagzxr/hvwUpKAtOS/vm4B/jvweeDewmuRJEk9Mgw8F/gRsIvyjYi85n7tAK4AXgIswaMdkjqjASwmz5YryLOm9PPOa+7XLtLw79kkBpAkSQNmGLgQ+BoGdv1w3Q18HDiPnNM1ESBpLhrkGXIeeabcTfnnm9f8rh3kXX8hfvxLA80jANJg20VKx9eRMvIVpLRc9XQYcBIp1T0E2AJsx0kBklo3BBwHvAB4K/Bk0ndE9TVOPv7/GPgGOQooaUCZAJA0BWwA1gNHkY7OQ0VXpPk4hPQGmJkUcDdwB/k9S9KBjJAO/79BzvqfgO+DupsALiWj/r6JH//SwDMBIAlSCbARuJl8NB6P5eN1toCU764h1QCHkiTAPaQUVJLurwEcDfwq8BbgfNIg1vF+9TYF/AfZ+b8cR8ZKwgSApD12AZuAq0kgeBw+I+puZlLAWcBq4C4yKWBnyUVJqpRRsuv/VtLs73g8I94PJoEvAu8ArsTnvqRpBveS7q8J/Ix0CV5Cyj/tCVBvC4DDgUcA55Bg/yfAGPYGkAbZEDny9Urg7cATgEW4698PxoF/Bf4AuIYk+CUJMAEgaV+7gTuBq8iH47HkXKhBYb0dAiwFHk8aBd5Ljn14HlQaPIuAXyC7wy8m/V+MCeuvSd7fnwTeBdyAiV5JD+DDXtJsdgPbgOvZ0xH6cEwC9INDSW+As0mZ7zbSG8DyUKn/jZIE4IuB3wEeg1Ve/aJJjvF9AvgA8GP8+Jc0CxMAkvZnJglwLWkk9Aiya6T+sJhMCjiJNAC7E5sESv1qpsnfs4E3kRF/y4uuSJ12O/AXwEfIVB8//iXNygSApAPZTebIX0s+Dh8FHFF0ReqkEXLE4wzg4eR3vAlHBkr9ZISc738d8DIyGWS06IrUaRuBdwN/RZ7hJnIl7ZcJAEmtGAeuI13k15IGgeoPDVINcBLwOHIs4MekR4CkelsGvJyU+58PPAxHvPabm8mYv0+Qd7QkSVLHLAQuAq4gZ8Z3e/XdtQP4DHAhOfLhx4JULw1y715I7uUdlH+ueHX+2gl8nxznsKJDUsusAJDUjkmy2/ATUjK+nDQJVP8YAk4kc8GXAVvJMZDJkouS1JKFwKmk3P+twGOxyV8/mgC+STr9f4EkeSSpJSYAJLVrCrht+lpG5kibBOgjEP31AAAafklEQVQvC4CHkLPCp5Idxa3A3WTnSVK1NMi0ll8C3gI8hzyfndzSfyaAL5Mz/1/BUa6S2mQCQNJcTAEbgBuBh5LA012m/nMo6Rx+Bvkdj5FpARMlFyVpL4uBJ5Lu/i8GHkl6eaj/jJNjHe8CvouVWZLmwASApLnaBdwBXEPOmx5Huk2rvywgv981JBHwYNJo6i7yNyCpjGHysX8x8AbgPNKg1V3//rQN+CTwJ8CPcFqLpDkyASBpPnaTHeEfkhLUE4HDi65I3TJESorPJImABpk1PV5yUdKAWgq8EHgbKftfhVVY/Wwz8DHgfWRKS7PsciRJkrLz9BvADWRnuHSHZK/uXbuAe4DPA88mJchOC5C6a2Zk57PJvXcPPmv7/dpF3qmvw/G7kjrECgBJnbIDuJbsVByH86b72QJSfnwiOXu8lDQI3M6e8ZCSOqMBHEGqb15Ddv0fTe5By/371xQZufvHwD+SZ6wkzZsJAEmdNEkaA64HVgNH4nOm3y0CHjV9HUGSAHfj+VSpE0aAk4CLSJO/Z5DGq+pvE8BlwP8kY/48aiWpYwzMJXXaFHALsA44CliJYwL73aHAw8kO5SPIruTtGLRK87EU+EXS4O+FwAnY3X8QjAOXkE7/X8VO/5I6zASApG5osmdM4Cg5EnBY0RWp2xaQ3/WxwFmkAuQeYAsGsFI7FgLnAG8GXsme6hrL/fvfNuCfgPcC3yNHqiSpo0wASOqWXcAm4Gr2nBd/UNEVqRcOIY3KTgbOJlMhbifHAuwNIO1fgyRLX07O+Z9Pyv2N1QbDFuD/AX9G+ul4jEqSJNXWYtLF2AkBg3ftAL4LvJFUBVjCLO1tmNwbbyT3yg7K37devbt2AdcBryI9VSSpq8wqS+qFCeBHpDngCeRsq8+fwTAErACeAJxGjgNsI+dcnWWtQTZzbzwV+F3gYlIBYM+UwTEJXAn8HvCvwL1llyNpEBiAS+qVKeAm4DYyHWA57gYPksNI8ucs0iegSY4FjJNdMGlQNMgz8Hwy1u+V5L6wT8pgGQO+AvwR8CXslSKpR0wASOqlJqkCmGkOuAr7AgyaxWSs2aPJ5ID7gJ9h8KvBsJBUw7yClHyfRyqiNFi2kB3/9wLfxvP+knrIBICkXptpDngd6Wp9AmkUp8ExRJqbnUISAUeRxNB2PBag/jREzvm/gfRDeQr5uz+05KJUxCbS7O+D2OxPUgEmACSV0AS2AleRj75HkJ1hDY4F5AjIkaT8+XHT/20zKY31WID6QYNUujwP+H3gl4CVpNzfsX6D5xbgPcBHyajcXWWXI0mS1HtDwNNJ9+v7KN+R2avcdS9wCfBrpDmaPSJUV8Pkb/jXyN/0vZS/v7zKXTuAbwEXYpNHSYVZASCptCbwY+B6YAkpix3G3bFBdChpEPgE4Pjp/7aNBM8eDVAdDJEGp08BfoOc8z8Vk1mDqgncBXwBeCfwNdz1l1SYCQBJVbAbuJ2ch9xNSmSPwCTAIFpAGqWdAjyGNIpssGd04O5yS5P2a6az/3nko//VwBPJXHefY4NppuntJ4D3Az/Ej39JFWACQFJVNEk3+OvIeLhjSKM4g+fBtAB4CPBI4EwyH31mN2284LqkB1pCRvq9inT3Px94GD67BlmTJLQ/CPw1cCt+/EuqCBMAkqpkN/n4v57snBxHGmhpcA2Rj6mTgbPJEYHtwEY8FqCyhoDHklL/1wBPIuf+PeOty4E/BD5NEttWLkmSJB3EEOkO/wVyBrx0Eyevalz3ATcB7wJOA0ZI+bXUCw3yN3cy8D9IxdJ9ZHe39L3hVf7aAXwGOB0TQZIqygoASVXVJLu8l0//+9HkbLhltYPtEFJyfTbZcV1GxgbeA+wkQbjUaQ3gcHIk5WLgHcAvk7+/Q/C5NOiawE+Aj5Fmf9dhhZKkijIBIKnqtgJXkaMBy0lfAJ9dapCPr7NIj4BFZPdtDBMB6qyFwEnA84A3Ac9nT3NKaYI0+Ptz4C9JIkCSKssgWlIdjJEdldvI7u/Dycg46VAyNeJsUna7mJRk3w1MFlyX6m9mGsUvk3P+LwJOAA4ruShVyjhwCfA+4LPAnWWXI0kHZwJAUl3cRzopX0cCcANx3d8wSQScATyaNA4cI1MDpgquS/UzTEr9fwV4LfBccuZ/BEv9tcc24G+B9wCX4XQSSTVhAkBSnewCNgE/IGWXJ5LSbwnycTZKEgGPBh5PKgI2kWDdYwE6kAZwPPBS4C3ALwJrgCPww197Ww98CHg/8GNMMkqqEV9okupqEfBMcib3dLJrJ91fkwTmVwL/REp015OjATboEuSjf5ic6X868EL2PE88468HmiQJ6D8D/oOMJJWkWjEBIKnOhkkTuDcBTyH9AaTZTJBmkv8EfAm4hRwR0OBaCBwLPI2c8z+dlPlLs9lKnh3vB76Hu/6SasojAJLqbBdwO/Cj6X9eSSoDTG7qgYZI88iZZoEPIVMD7sWpAYOkQUr6H0m6+b+B7PqfgHPbNbsm6T/zl+Tjf+Z9I0m1ZAJAUt3tBraQMUw/JaMCl2Iwr9kdRnZ9H0MaBh5JAvx7SKNJEwH9qQE8mPzOLwJeRxIAJ+Guv/ZvAvgu8F7gr4EN+IyQVHMmACT1i3HgBuBGssN3NE4J0P6NkL+RM0nDwJWkEmALjg/sN6Ok8uMlwKtJ75A1wIMKrknVt430DXkvKf33vL+kvmCZrKR+M0TKeS8GXkwqAmzmpQNpkgTSeuCrwCeAq7FHQN2NAmuBXyc9Qo6d/m8+D3QgTWAjKfn/BLAOz/tL6iMmACT1q0WkudebSKNApwSoFVPAZtLh+1+A75CdQD8A6mGI3PtnAb9EOvuvwCNBas0kueffT54BJgEl9R2PAEjqV/eRIwFXAkcBy8iRABOfOpCZJnGPAs4jc+EhFQL3YSKgqkZItc+5wGuANwPnk2aP7vjrYJrAXeSj/+3A18n5f0nqOyYAJPWzmVLOK8jOzsNIIzCffTqYBeRv5VSSCHgEcDhJAsxMDlB5I8Bq4OeBVwKvJR/+S/DDX62ZJL1jPga8D7iOvDskqS+5EyZpEDTIZIALSG+Ac8kMcKlVM8mkK4FLyQ7hjVgiXMpC0uvjXODJZLTjKvzoV3vGgG8CfwV8GdhadjmS1H0mACQNklHgZOClwAtIUkBqxxT5SLgRuISUDF+F5cK9MgKcQs72P5l081+CPT7Uvk3APwIfB67Fe1jSgDABIGnQNEg/gF8Efpt0Bpfa1SS7h7eQJMCnMBHQTSPAacBzSHPPE0gVgDv+mot1wDvJmL8tWPIvaYCYAJA0qBrkbPdbSBnxIvyY0NxMkeMB/wF8Hvge+aiYLLmoPjBMqnTOAp5BPvzt6K+5agLbyajP9wLfxg9/SQPIBICkQdYgDcQuJkcCVuPHheauSUYIXgZ8ZvrnBjJBwA+N1jTIUZ2VwNlkx/9sUrVjgk5zNQXczJ6S/3V4T0oaUCYAJCm7jE8jiYCzsUGg5m8zaRh4CdlpvJH0DvCjY3YNcpZ/DXAO6ep/Ovnwl+ZjO0nGfZxU6djoT9JAMwEgSTFKzhj/KqkG8MND89UEtpGP/8uAr5BkgImAPWY+/M8Bfo4k4NYAi3HHX/O3CfgH4O+Bq0k1jiQNNBMAkrTHTIPAFwAvJxMDPBKg+WqSD49NZOTY54HvTP/7oPYJGAaWA48l5/vPnf73Ufzw1/xNkQ/+jwL/SipyTLpJEiYAJGk2C4EzgdeTowGLyi5HfWSSVAVcBXwR+BJwPYOTCBgmO/wXkg//U8huv2P81CnbgX8HPgz8AHf9JWkvJgAkaf+WAS8i1QBr8CNFnTUFrCddyf+eJAJmpgf0y25lgz3d/NcCLwTOJ+M3ra5RJ00C1wIfI83+NpddjiRVkwkASTqwEVKe/HrgAqwGUOfNTA/4OukTcBlwCzBGfRMBDVJJs5qc6/85MnbTbv7qhu3Al8mu/7eBibLLkaTqMgEgSQfXILuXLwWeST5qrAZQpzVJBcBV5CPmv6b/eaYqoA5mdvtPAx5PmvudNv3f/PBXp02SZNlngb8iDTfrmjSTpJ4wASBJrVtGdjEvnv5pNYC6YaZp4Hrge8DXpn/eTHXPM48CJwBnAU+a/rkKm/qpe7aRqplPkGM0W4quRpJqwgSAJLVnhFQD/ArpD7Cy7HLU5ybJh82NpCrgEpIMGCu5qPtZSD72f57s9q8hu/1WyKib1gN/DfwTuTcs+ZekFpkAkKT2Ncju/wXAm8kZZxuaqZuaJBkw0yvgU6TD+UbSTLBXZc8N8re+gkzKeA5p6reMfPS7269umiQjNP+U7PrXuU+GJBVhAkCS5mc18FrguaTk2USAemGczDn/OnDp9D9vJTuhnf4gapDKlyVkbN+TyRGYU0iJv9Rtk8AG4J+Bj5Bz/5KkOTABIEnztwR4GmkS+FjsDaDemQQ2AVcCXyS7o+vJ+ej5Ng4cIn/bK0mVy1OB04HlWOKv3miSDv+XAR8HvkQSXZKkOTIBIEmdMUI+jp5PJgWcgOXQ6q2tpBLgSuByMhO93XGC9x/fdzLwGFLqfwpJBki90iSNLz9LzvpfhWf9JWneTABIUuc0yFnoc4FXk6Zolkirl5rkI2kL+fi/EvgK+XjaxP4/oEbI3+5Mif+ZwLHT/20Ek1nqrTHgm8BHp39uwbP+ktQRJgAkqfOGyaSAXwdeQHoDSL02kwzYTKoBvkYmCVxFyqohx1VOI8mqJ5Fdfz/6VdI64B/IeL+bmf9RFknS/ZgAkKTuuP+kgNeSM9TORFcp908GfA/4wvR//wUyxs+PfpXUJLv+3yZN/r5KklTu+ktSh5kAkKTuapAKgBcBv0LmpNtATaVNTf90aoVKmwRuJDv+f0dGW/rhL0ldckjpBUhSn9tNOrJfAVwHLCXN1Eb4/+3d76/WdR3H8eeunU6n04kYMUZEjDHGGGOMOSJyRIZimJpj1lxrzXmjdbN/oHuttrZmplk3XD8wlzVjhD9gkpIiIZEaIRIjQoaIioRIp9PheHnRjde5doxFHOA65/O9ruv52JjsbG6fW2d8Xt/3+/UxhFU5Nfzar7IawD/IM5bfAjaSXf9zJQ8lSZ3OAECSJscI8DIpZTtN1gM+gl9gJXWfIfK78KfAvWQt5WzRE0lSlzAAkKTJcw54E3gRODD6s4+SbgCnASR1ugbwBrABuAvYBLyKX/0ladIYAEjS5BsGjpKvXq8AHwNmYgggqXM1gN3Ad4GfkJcp/l30RJLUhQwAJKmMBmm53gs8Q/axP45N7JI6Sx14Hfg58E3S8P82Fv1JUhEGAJJUVoOsBewgTdjNboD340SApPbVLPl7CvgO+er/Kl78JakoAwBJqoazJADYA/wLmDr6x5JASe1mmHSd3A/cDezEcX9JqgQDAEmqjgZ5ButF4CUyATAL+GDJQ0nSODWA18iTfj8Afkv6TvzqL0kVYQAgSdVyjjyR9TLwAmnMngLMwGkASdU1DDwL3APcB/yF/C6TJFWIAYAkVdM5UpS1H3geGAHmkGkAuwEkVUWDvGbyM+B7wDay++/TfpJUQf4jUpLaQz+wEvg6sJpMBfhagKRSmi+ZbAV+TJ7484u/JFWcEwCS1B7eAf5OyrTeIN0AA2QtwDBX0mRpkKLSl4A7gbtIb8k7JQ8lSRofAwBJai9nyG7tS2TndgrwYfx9LmnijZDXSh4iF/9HgLeKnkiSdEn8B6MktZ86adb+M3CYTADMwNcCJE2cE8Bm4EfAg8Bf8au/JLUdx0Ylqb31knLA1cDtwLLRn0lSK4wAzwHrScHf0dGfSZLakBMAktTe3gVOkZWA3eSL3BzgQyUPJakjHAfuB74NPEmmAN4teiJJ0hVxAkCSOksfsAL4GpkKmE6KAiVpPOrASeAp4D5SPDpc8kCSpNZxAkCSOkuzH+DZ0f9+gIQAvRj6SrqwBvA2sAP4IXnaz3Z/SeowBgCS1HnOAf8kawHPkZcDpoz+sR9A0vmGgL3AA8D3ya7/W+R3iSSpgxgASFLnehd4k7wWsB84C0wjQUCt4LkkVUMdOAL8Brgb2Egmh9zzl6QOZQAgSZ3vLPAKCQIOAO8DZpL1AEnd6TSwFbgT+BWZGBoqeiJJ0oRzH1SSuksPMANYC3wDWIQlgVI3aZCJoHuBR0mzv8/6SVKXMACQpO61EPgicCswH+jH1QCpEzVIk/8hYAMZ+d9f9ESSpCIMACSpu/UBVwFfAq4jQUBf0RNJaqURcvHfBjxEikEd9ZekLmUHgCR1tzrpB3ge+Bsp/5qO0wBSu2sArwEPA/cAvyQdII77S1IXcwJAktTUA8wCVpOJgKuBqUVPJOlynAZ2kXH/rcBxEvZJkrqcAYAk6Xx9ZBVgLQkClgK9RU8kaTxGgL1k1H8zGf0fLnoiSVKlGABIkv6XGgkC5pKiwC+TUMAXA6TqqZPL/oOk4O8Iufg3Cp5JklRBBgCSpIupkaLAO4DrgdlYFChVwTBwlIz5rwdewEu/JOn/MACQJI3XNNILcCuwCpiDEwFSCSPk4r+d7PnvAk4VPZEkqS0YAEiSLkWzKHAVcAuwEphZ9ERSdzkO7AA2kQDgOH71lySNkwGAJOly9JFVgFXAbcByfDFAmigN0uy/G/g1Yxd/C/4kSZfEAECSdCWaRYHXkxcDlmE/gNRKQ4xd/LeR0X8v/pKky2IAIElqhV4SBNwEfAVYNPqzWsEzSe2qwdiTfr8gT/odG/2ZJEmXzQBAktRKPcA84HYSBswFBjAIkMajAQySJ/02AQ+QJ/3c8ZcktYQBgCRpIgyQpwNvAK4DFmAQIF1IAzgDHACeAB4nT/oNlTyUJKnzGABIkiZKjRQDLiFBwOrRv/eWPJRUMcNk1L958d9LwgC/+kuSWs4AQJI00WrANGAxsA74PFkN6Cl4Jqm0Ohn13wxsBPaTpn8v/pKkCWMAIEmaLD2MTQTcRoKAWbgWoO7SIIV+j5Jm/3148ZckTRIDAEnSZKuRPoDlwK0kCJiJqwHqbCOMXfw3MLbj78VfkjRpDAAkSSU1ywLvAFYAc4D+oieSWqdBLvnHgO3AerLjP1jyUJKk7mUAIEmqgmnASlIWuIo8JdhX9ETSlRkmO/7bgS3ATuBU0RNJkrqeAYAkqSp6gBlkNeBG4BoyEeBqgNrJCHAE2AY8Rkb9T5DSP0mSijIAkCRVTTMIWArcQp4PnIuvBqja6sBhcvHfSEb9T+LFX5JUIQYAkqSq6iGrAUsZez5wNr4aoGqpM1butwnYQ1r9vfhLkirHAECS1A76gMXk1YAvkImAPgwDVEaDsR3/h0mr/34y/i9JUmUZAEiS2kkfeTVgHVkNmAdMwSBAk6NBvu43R/03kFH/4ZKHkiRpvAwAJEntaApZDVhDygIXkXUBaaKcJF/5nwS2jv79TNETSZJ0iQwAJEntqkaCgEXk6cAbyXRAf8lDqeMMkib/R8iTfgfJxb9R8lCSJF0OAwBJUrurAQPAfGAtcDPpCxgoeSi1vUFS6LcJeIKM/Q/ixV+S1MYMACRJnaJGvv7PA64jPQFOBOhSDQK7Gbv4HyE7/l78JUltzwBAktSJasB00g/wVdIXMJ2UCErnGwZOkFH/9WTU/1TRE0mSNAEMACRJnW4m6Qj4HLCCPCHoVIAgX/uPkC/+W8jF/0TJA0mSNJEMACRJ3aAHmEFWAtYAK4GFGAR0q0HS4r+dtPrvJRf/eslDSZI00QwAJEndpIc8F7iQlAWuIq8IWBjYHQaBfcA24DHgAHAa9/slSV3CAECS1I1qJAiYB6wmYcASDAI6VbPR/xFy+T+MO/6SpC5kACBJ6mY1Ugw4G7ieBAErSBBQK3guXbkGcAbYSS7+TwDHsdFfktTFDAAkSRoznawFrAOuJr0B/RgGtIsGMEQu+juBjcAO/NovSRJgACBJ0vma6wHvLQxcAEzFIKCqGuSSf5Bc+B8nI//u90uS9B4GAJIkXdhUUhh4DXAtsJhMCfQUPJPG1IGTpMX/d6TV/yC5+EuSpPMYAEiSdHFTgLmkH+BaYDnpDTAIKKMOHAV2kWf8dgNHSNmfJEm6AAMASZLGrw+YCSwDbiTFgTNxNWCyNMh+/2byjN8e4AQp9pMkSRdhACBJ0qXrIS8FLCAvB6wF5o/+zKmA1qqTNv+D5NK/GThEyv7qBc8lSVLbMQCQJOnK9JD1gFWkNHA5mQrow8mAy9UgX/WPA88BW4CngGNY6idJ0mUzAJAkqTV6yLOBS4EbSF/AXFIk6FTA+NRJgd8hst+/hRT8ncSv/ZIkXTEDAEmSWqtGLv2LSQjwaWAJMAuDgAupk6/7e4A/ADuBfWT0X5IktYgBgCRJE6NGOgFmk6mANeQ5weZ6gLLH/zqwjbT57yFBwBCO+kuS1HIGAJIkTbxeYBqwkAQBq8mEwEDJQxV0moz2P052+w+Sr/0jBc8kSVLHMwCQJGny1EgYMJOsB9wMrCTdAb10bmlgg1zujwHbSZv/bvKEXx2/9kuSNCkMACRJKmcAWATcQoKABWRSoLfkoVpoGDgF7AeeAR4mX/uHSh5KkqRuZQAgSVJ5feTy3ywNXExeEBig/YoD62Sc/zAp8nuGlPodxhF/SZKKMgCQJKk6eoHpwHz+OwyYRfWnAoaB4+TS/zQZ8T9EJgC8+EuSVAEGAJIkVVPzBYElwKfIisBCqlcceIZc+neSJ/z2M9bkL0mSKsQAQJKkautlLAy4ClhHpgOmU640sEEK/HYAm4AXyNf/QbICIEmSKsgAQJKk9lED+oFlZCLgM2RFYCoT+4pAs8X/FHm+72nS5r+HjP7b4i9JUhswAJAkqT31kOcElwKfJVMB84EppFSwFYaB02SXfyfwexIANJ/vkyRJbcQAQJKk9tdPLv8rSV/AQvKKwFQu/RWBOvnSf4Ts9j8L7CIhwHBLTitJkoowAJAkqXP0ATPI5X8J8ElgOekP6L/I/ztIyvt2An8iX/qPkq/9tvhLktQBDAAkSeo8NRIGTCPTAFcDnwAWkTCg+aTgCLn07wP+SC7/Bxl7us/dfkmSOogBgCRJna1ZHNgMA9YAN5FR/0fJXv9+sus/hJd+SZI61n8AIPY+fxiZ4SgAAAAASUVORK5CYII=", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnIAAAJyCAYAAABALi2VAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAACcpSURBVHja7N19jF3lfej731prv47HYwbb2OAWamS7kBJOpCAnIZyjGzW6VKkUqWkr3dNEitRWR0p1qlvpVr1qe9OjtEpVcVpFisJRaZM0uWmivBRCiwgO0NASl1enfmkMxDge8xJbGIPxvO2Zvfda6/xh9s7YGJKUGvba8/lIlsdjY+Bnz+zvPGut50nKsgwA3jiPPPLI9hdeeOHQ0aNHY35+PmZnZ2NxcTF6vV50u93odDqxtLQUS0tL0e/3Y3l5OZaWlmJ5eTm63W50u93o9/vx0ksvRZ7n0e12o9frRZ7nURRFREQkSTJ8m3+fJEmiLMv4rd/6rXtuvvnm/9NEGEU1IwD4j3HkyJHs5MmTVz733HNXz87Obl5eXp6YnZ3d/Pzzz28/ceLEjpMnT17+4osvTs3Ozkan04mIiG63Owy2iIiyLKPf70e/349GozGMs6IooizL4bdBpBVFEXmehy/KQcgB8GN48sknJ44dO3bN3NzcxqNHj+48dOjQe5577rnti4uL051Opzk/Pz9cUet0OjE3NzdccVu5SjZY8VkpTdPh24uLi8Nw+0kkSXLe3xsQcgCr0je/+c33PvLIIx86evTozuPHj1998uTJePbZZ+PUqVOxtLQ0jLBGoxERZ1bWut3uMKbSNI0sy6JWq521qpamaSRJMvxnBr8+SZJI0/Ss1bjzBdvK7we/x8rvASEHsGocOHBg85NPPvl/PP/881cePnz4vzz88MM37tu3L5aXl6PRaAzvYxusnJVlGVmWRZZlURTFMOoiItrtduR5Hv1+fxhkP4k8z1813lZGn2gDIQewKu3ateu9u3fv/m+PPfbYjUeOHJmamZmJ2dnZs4IpSZJYu3ZtFEUR3W73FSGV5/lZ0dVut2NycjKef/75swLs3BW0lStyg0uhg3/fyh8XRTF838rVt8F9dYCQA1gVvv3tb7/9wIED79+7d+8Hdu/efc0LL7wQp0+fHl6+XPnU52Clrdvtxuzs7PD9jUYjiqKIXq83/HVpmkav14uyLKPT6QwfZog4c1k1TdPh779yZe58q27DT9ArLsO+1qXV8/04SZLX/L0BIQdQCffcc8979u3b90v79u17/7Fjx644fvx4HDlyZLhFx8p70FauevV6vWGsDeJtsB3IILQGT5iu/GcHcRcRw99/5erZyvgbPHW6MsQG4Xa+FbdzY23lr3eJFYQcwFjYv3//lnvvvfd3Z2Zmdn73u9+9/siRI3Hy5MnhStlrPdV57vsHDy6c69zQWnnP2mvdD/dqkfbjhNjKXyPcACEHjI2DBw9u2LNnz3+9//77P7Jnz56rn3zyyVhaWjrrydHBJU4AIQcwAh566KGr//Iv//Lvv/zlL28fPF2aZdlZ96kNtvOweS4g5ADeZAcPHtxw++23/9k//MM//MbevXuj2WxGu90ebg9Sr9djYmJi+ETpuZczB/e3AQg5gDfI448/Pn3PPff87u233/4Hjz/+eMzOzg4fShgEWpZlZ73vfJxDCgg5gDfIfffdd/2uXbv+YO/evb946NCheOqpp6LRaAwfQmi328PD5Ac/HmzEO9ibbeXTqUIOEHIAF9idd975i//0T//024888siNe/bsicXFxZiYmIh2ux2dTieazWbUarVYWFiIiB8ek9XpdIZbhpx7T1ySJFGv18/7JCqAkAN4nQ4fPty8+eab77rjjjve8/3vf394BFZExPLycuR5Hq1WK5aWlobHZ0Wc2fttcEzWylCr1+uRpmn0+/3I81zEAUIO4EL4i7/4i0/81V/91e8cOnRo+L6VpxQM3l55rumPCrPXul8OQMgBvE5/8zd/8ztf+tKXPrFnz57hpVIAhBwwwp544ompW2655fa///u/f8+LL744PMcUACEHjLBvfOMbN37+85//3K5duzbPzs5GrVaLWs2nJgAhB4ysAwcObP7CF77wuX/8x3+8ce/evZEkyfBJVBv1Agg5YER9/vOf/+2Pf/zjn3zyyScjSZKo1WqRJEn0+/3h06cR4clSACEHjIqZmZnsj/7ojw797d/+7ZX1ej2azebw+KyyLM96MtXlVQAhB4yI+++//+2f/OQn77nrrrumBxvyLi0tRZIkw4BLkiRarVb0+30POwAIOWAU3Hnnnb/4hS984dP33Xff9OLiYiRJEouLi6/4dWVZRqfTMTBGwuBoNxBywKr15S9/+cOf+cxnPvfII4/E3NxcJEkSSZJEmqZnXUoFQMgBI+TP/uzP/tc3vvGNj3z729+O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"], "orderId": "6ce9b8c2-2c54-479a-8f2e-831c28ee58dd", "condition": "MAJOR_DAMAGE", "disputeId": "DSP-1761117543990-sbiykm"}	f	2025-10-22 14:19:04.108679	2025-10-22 14:19:04.108679
NOTIF-1761192063298-ller	user-seller	order_completed	✅ Tin đăng đã được duyệt!	Tin đăng "Bán Container mới 100%" đã được duyệt và hiển thị công khai. Buyer có thể xem và gửi RFQ ngay bây giờ.	{"action": "listing_approved", "actionUrl": "/listings/ab1c7335-ff85-4782-87c7-3ea188d88305", "listingId": "ab1c7335-ff85-4782-87c7-3ea188d88305"}	f	2025-10-23 11:01:03.300477	2025-10-23 11:01:03.300477
NOTIF-1761192152161-ller	user-seller	rfq_received	Yêu cầu báo giá mới	Người mua container đã gửi yêu cầu báo giá cho Bán Container mới 100%	{"rfqId": "1b5f0424-70eb-4e13-bc26-0f124aff77eb", "purpose": "PURCHASE", "quantity": 100, "buyerName": "Người mua container", "listingId": "ab1c7335-ff85-4782-87c7-3ea188d88305"}	f	2025-10-23 11:02:32.162926	2025-10-23 11:02:32.162926
NOTIF-1761194586853-ller	user-seller	order_completed	✅ Tin đăng đã được duyệt!	Tin đăng "Container mới 100% cần bán" đã được duyệt và hiển thị công khai. Buyer có thể xem và gửi RFQ ngay bây giờ.	{"action": "listing_approved", "actionUrl": "/listings/6e5e38f3-7a09-4b6f-ac03-1f92b192aea8", "listingId": "6e5e38f3-7a09-4b6f-ac03-1f92b192aea8"}	f	2025-10-23 11:43:06.855887	2025-10-23 11:43:06.855887
NOTIF-1761194629196-ller	user-seller	rfq_received	Yêu cầu báo giá mới	Người mua container đã gửi yêu cầu báo giá cho Container mới 100% cần bán	{"rfqId": "65bcd8c8-d8ef-4b9f-8518-1df7f85d5e56", "purpose": "PURCHASE", "quantity": 50, "buyerName": "Người mua container", "listingId": "6e5e38f3-7a09-4b6f-ac03-1f92b192aea8"}	f	2025-10-23 11:43:49.198689	2025-10-23 11:43:49.198689
NOTIF-1761194840141-ller	user-seller	payment_pending_verification	Buyer đã thanh toán - Cần xác nhận	Buyer đã xác nhận thanh toán 16.500.000.000 VND cho đơn hàng #AD985799. Vui lòng kiểm tra và xác nhận đã nhận được tiền.	{}	f	2025-10-23 11:47:20.142539	2025-10-23 11:47:20.142539
NOTIF-1761194840148-uyer	user-buyer	payment_submitted	Đã ghi nhận thanh toán	Thanh toán 16.500.000.000 VND cho đơn hàng #AD985799 đã được ghi nhận. Đang chờ seller xác nhận.	{}	f	2025-10-23 11:47:20.149169	2025-10-23 11:47:20.149169
NOTIF-1761117544118-uyer	user-buyer	dispute_created	Đã tạo tranh chấp	Tranh chấp #DSP-17611175439 đã được tạo cho đơn #6ce9b8c2. Admin sẽ liên hệ trong vòng 24h.	{"orderId": "6ce9b8c2-2c54-479a-8f2e-831c28ee58dd", "condition": "MAJOR_DAMAGE", "disputeId": "DSP-1761117543990-sbiykm"}	t	2025-10-22 14:19:04.119411	2025-10-24 13:25:06.140969
NOTIF-1761194904870-uyer	user-buyer	payment_verified	Thanh toán đã được xác nhận	Seller đã xác nhận nhận được thanh toán 16.500.000.000 VND cho đơn hàng #AD985799. Seller sẽ bắt đầu chuẩn bị hàng.	{}	t	2025-10-23 11:48:24.871912	2025-10-24 13:25:27.337564
37a79df6-e648-4ba9-87f1-84641667c97b	user-seller	transportation_booked	Vận chuyển đã được đặt	Buyer đã đặt vận chuyển cho đơn hàng #ORD-1761194739715-TW2FN. Ngày giao: 24/10/2025	{"order_id": "a4d89d1a-d4de-4d09-9cb7-2360ad985799", "delivery_date": "2025-10-24", "delivery_method": "self_pickup"}	f	2025-10-23 04:50:15.888	2025-10-23 04:50:15.888
NOTIF-1761196520760-ller	user-seller	order_completed	🎉 Đơn hàng hoàn tất!	Buyer đã xác nhận nhận hàng cho đơn #a4d89d1a. Hàng trong tình trạng tốt.	{"notes": "", "orderId": "a4d89d1a-d4de-4d09-9cb7-2360ad985799", "condition": "GOOD", "receivedBy": "Nguyễn Văn Anh"}	f	2025-10-23 12:15:20.762423	2025-10-23 12:15:20.762423
NOTIF-1761196520766-uyer	user-buyer	receipt_confirmed	Xác nhận nhận hàng thành công	Bạn đã xác nhận nhận hàng cho đơn #a4d89d1a. Cảm ơn bạn đã sử dụng dịch vụ!	{"orderId": "a4d89d1a-d4de-4d09-9cb7-2360ad985799", "condition": "GOOD"}	t	2025-10-23 12:15:20.767525	2025-10-24 13:24:26.403978
NOTIF-1761196486977-uyer	user-buyer	container_delivered	Container đã được giao!	Container đã được giao đến địa chỉ của bạn. Vui lòng kiểm tra và xác nhận trong vòng 7 ngày.	{"eirData": null, "orderId": "a4d89d1a-d4de-4d09-9cb7-2360ad985799", "deliveredAt": "2025-10-24T05:06"}	t	2025-10-23 12:14:46.980223	2025-10-24 13:24:28.616463
NOTIF-1761194986592-uyer	user-buyer	container_ready	Container sẵn sàng!	Container của bạn đã sẵn sàng. Vui lòng sắp xếp vận chuyển.	{"orderId": "a4d89d1a-d4de-4d09-9cb7-2360ad985799", "pickupContact": {"name": "Thái Dương", "email": "caothaiduong@gmail.com", "phone": "+84344964979"}, "pickupLocation": {"lat": "", "lng": "", "city": "Hồ Chí Minh", "address": "Khu công nghiệp Đình Vũ, Hải Phong", "country": "Vietnam", "postalCode": ""}, "pickupTimeWindow": {"to": "2025-10-25T11:49", "from": "2025-10-24T11:49"}, "pickupInstructions": null}	t	2025-10-23 11:49:46.593543	2025-10-24 13:24:29.801534
NOTIF-1761194941847-uyer	user-buyer	preparation_started	Seller đang chuẩn bị hàng	Seller đã bắt đầu chuẩn bị container của bạn, dự kiến sẵn sàng vào 24/10/2025.	{"orderId": "a4d89d1a-d4de-4d09-9cb7-2360ad985799", "preparationNotes": "Chuân bị hàng ", "estimatedReadyDate": "2025-10-24T00:00:00.000Z"}	t	2025-10-23 11:49:01.849326	2025-10-24 13:24:56.269672
NOTIF-1761622659249-uyer	user-buyer	order_completed	✅ Tin đăng đã được duyệt!	Tin đăng "Buyer cần bán Container" đã được duyệt và hiển thị công khai. Buyer có thể xem và gửi RFQ ngay bây giờ.	{"action": "listing_approved", "actionUrl": "/listings/e55ae805-34c1-4ed5-93ab-8927b9b877a0", "listingId": "e55ae805-34c1-4ed5-93ab-8927b9b877a0"}	f	2025-10-28 10:37:39.251767	2025-10-28 10:37:39.251767
NOTIF-1761622707582-uyer	user-buyer	rfq_received	Yêu cầu báo giá mới	Người bán container đã gửi yêu cầu báo giá cho Buyer cần bán Container	{"rfqId": "da8ccc73-598f-4e97-a7fb-370ac8163f98", "purpose": "PURCHASE", "quantity": 20, "buyerName": "Người bán container", "listingId": "e55ae805-34c1-4ed5-93ab-8927b9b877a0"}	f	2025-10-28 10:38:27.585128	2025-10-28 10:38:27.585128
NOTIF-1761883941734-ller	user-seller	order_completed	✅ Tin đăng đã được duyệt!	Tin đăng "Container Container sàn phẳng 40 feet - Đạt chuẩn vận chuyển" đã được duyệt và hiển thị công khai. Buyer có thể xem và gửi RFQ ngay bây giờ.	{"action": "listing_approved", "actionUrl": "/listings/4988d8f6-b8e4-4298-be96-b084d5c8cd10", "listingId": "4988d8f6-b8e4-4298-be96-b084d5c8cd10"}	t	2025-10-31 11:12:21.753513	2025-10-31 12:03:23.618412
NOTIF-1761622396053-ller	user-seller	rfq_received	Yêu cầu báo giá mới	Người bán container đã gửi yêu cầu báo giá cho Bán Container mới 100%	{"rfqId": "943aced2-3117-4ddf-87ee-4674d2bbb47f", "purpose": "PURCHASE", "quantity": 1, "buyerName": "Người bán container", "listingId": "ab1c7335-ff85-4782-87c7-3ea188d88305"}	t	2025-10-28 10:33:16.055441	2025-10-31 12:03:25.289145
NOTIF-1761622362254-ller	user-seller	rfq_received	Yêu cầu báo giá mới	Người mua container đã gửi yêu cầu báo giá cho Container mới 100% cần bán	{"rfqId": "2d424f9a-94b6-4379-aa1c-efbe98962aa6", "purpose": "PURCHASE", "quantity": 1, "buyerName": "Người mua container", "listingId": "6e5e38f3-7a09-4b6f-ac03-1f92b192aea8"}	t	2025-10-28 10:32:42.260017	2025-10-31 12:03:26.168724
NOTIF-1761886487850-ller	user-seller	rfq_received	Yêu cầu báo giá mới	Người mua container đã gửi yêu cầu báo giá cho Container Container sàn phẳng 40 feet - Đạt chuẩn vận chuyển	{"rfqId": "9708c22a-c425-4bd4-9af8-525d6d15688e", "purpose": "RENTAL", "quantity": 100, "buyerName": "Người mua container", "listingId": "4988d8f6-b8e4-4298-be96-b084d5c8cd10"}	t	2025-10-31 11:54:47.852147	2025-10-31 12:03:26.976141
NOTIF-1761903035055-uyer	user-buyer	payment_submitted	Đã ghi nhận thanh toán	Thanh toán 1.650.000.000 VND cho đơn hàng #4035D27A đã được ghi nhận. Đang chờ seller xác nhận.	{"priority": "medium", "action_url": null}	f	2025-10-31 16:30:35.056734	2025-10-31 16:30:35.056734
NOTIF-1761903035050-ller	user-seller	payment_pending_verification	Buyer đã thanh toán - Cần xác nhận	Buyer đã xác nhận thanh toán 1.650.000.000 VND cho đơn hàng #4035D27A. Vui lòng kiểm tra và xác nhận đã nhận được tiền.	{"priority": "medium", "action_url": null}	t	2025-10-31 16:30:35.052502	2025-10-31 16:31:14.646704
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, item_type, ref_id, description, qty, unit_price, total_price, created_at) FROM stdin;
order-item-1760515673072-rykqyrghg	order-1760515673064-r3elbetv7	CONTAINER	b8976813-52e4-4065-bf32-55ce05ab3265	Standard - 20ft	15.000000000000000000000000000000	180000000.000000000000000000000000000000	2700000000.000000000000000000000000000000	2025-10-15 08:07:53.072
order-item-1760579400630-8woinxnuw	order-1760579400569-r3w46fegd	CONTAINER	e8b693ed-0ccc-4b1a-872d-e1249e59f1b4	Standard - 20ft	10.000000000000000000000000000000	24000000.000000000000000000000000000000	240000000.000000000000000000000000000000	2025-10-16 01:50:00.63
order-item-1760580381647-fcr06tsrd	order-1760580381640-oehwce3k0	CONTAINER	a8f5af5d-3072-49b3-975d-3d8b9cb45399	Standard - 20ft	20.000000000000000000000000000000	30000000.000000000000000000000000000000	600000000.000000000000000000000000000000	2025-10-16 02:06:21.648
b37c9368-6fb5-42c7-bf3f-c43669c86f4b	31123a4d-db53-41e5-b135-3a4a81e62d84	CONTAINER	cb2d73f1-5348-403d-a060-b9b835d7f881	Standard - 20ft	10.000000000000000000000000000000	9000000.000000000000000000000000000000	90000000.000000000000000000000000000000	2025-10-16 03:01:58.819
8a10927d-70e4-4871-ab67-1981e9d58d9a	30e8218f-de1a-4a35-995b-57061d7f9fba	CONTAINER	cb2d73f1-5348-403d-a060-b9b835d7f881	Standard - 20ft	10.000000000000000000000000000000	9000000.000000000000000000000000000000	90000000.000000000000000000000000000000	2025-10-16 03:06:03.403
907e9e28-35cf-4064-bb75-9784ba760fc0	87937cd4-cd5c-45a2-b285-995d3b1f7c1a	CONTAINER	70ec4610-ac7e-47bd-902f-efe2b77904a8	Standard - 20ft	15.000000000000000000000000000000	18000000.000000000000000000000000000000	270000000.000000000000000000000000000000	2025-10-16 03:08:22.01
c7a88bfe-7d8d-4903-b52c-ebda15258695	152a6aa6-7423-4977-8910-acf1b97c5299	CONTAINER	cb2d73f1-5348-403d-a060-b9b835d7f881	Standard - 20ft	10.000000000000000000000000000000	9000000.000000000000000000000000000000	90000000.000000000000000000000000000000	2025-10-16 03:11:23.866
819b91f1-6c29-4ce3-8dda-28da2b5520ed	c5b70504-95ff-43cd-89bd-15589e401bcc	CONTAINER	cb2d73f1-5348-403d-a060-b9b835d7f881	Standard - 20ft	10.000000000000000000000000000000	9000000.000000000000000000000000000000	90000000.000000000000000000000000000000	2025-10-16 03:39:25.387
37062b18-1f81-4c85-8b19-e5f0810d7576	6a6330ca-ea0f-44b1-afba-75929232f31f	CONTAINER	cb2d73f1-5348-403d-a060-b9b835d7f881	Standard - 20ft	10.000000000000000000000000000000	9000000.000000000000000000000000000000	90000000.000000000000000000000000000000	2025-10-16 04:02:39.503
5795a4af-f190-4cb7-9780-7eb7c1db5f78	a0a42cff-2996-4c53-a8fc-f062f11f8130	CONTAINER	cb2d73f1-5348-403d-a060-b9b835d7f881	Standard - 20ft	10.000000000000000000000000000000	9000000.000000000000000000000000000000	90000000.000000000000000000000000000000	2025-10-16 04:12:12.429
0164cb36-da4a-497b-b121-8326cfdc9cc3	b0a8e8d1-624d-4f38-9cef-419d5ad49be2	CONTAINER	688f02af-2964-41a0-a11d-a9cd1c440da8	Container - Standard 20ft	10.000000000000000000000000000000	19000000.000000000000000000000000000000	190000000.000000000000000000000000000000	2025-10-18 02:31:10.95
71bdf684-c3cf-434a-879e-c2f3694e06e8	745201cf-581b-4b4f-a173-718226677fec	CONTAINER	3669265c-baad-4507-a903-b65f710a42b6	Container - Standard 20ft	15.000000000000000000000000000000	32000000.000000000000000000000000000000	480000000.000000000000000000000000000000	2025-10-20 06:42:44.973
a624f83d-7cb4-4842-8dfb-6f0c118be580	6ce9b8c2-2c54-479a-8f2e-831c28ee58dd	CONTAINER	154aff95-b692-4ef5-82df-de703e3ced7e	Container - Standard 20ft	100.000000000000000000000000000000	34000000.000000000000000000000000000000	3400000000.000000000000000000000000000000	2025-10-20 09:45:01.243
70f9c3ae-334d-466c-bbd1-fd8dda7f7eb6	72682c91-7499-4f0c-85a6-b2f78a75dbcd	CONTAINER	36eeea65-c5ad-47e5-9452-57d1db810e0f	Container - Standard 20ft	70.000000000000000000000000000000	24000000.000000000000000000000000000000	1680000000.000000000000000000000000000000	2025-10-21 07:34:18.334
1270dbd3-ef68-4621-890e-3b37d9a8213c	a4d89d1a-d4de-4d09-9cb7-2360ad985799	CONTAINER	65bcd8c8-d8ef-4b9f-8518-1df7f85d5e56	Container - FR 40ft	50.000000000000000000000000000000	300000000.000000000000000000000000000000	15000000000.000000000000000000000000000000	2025-10-23 04:45:39.717
9ec692a5-dd29-43a7-8d86-c460801df10d	411ae9fe-1219-47a3-aa56-7d344035d27a	CONTAINER	9708c22a-c425-4bd4-9af8-525d6d15688e	Container - FR 40ft	100.000000000000000000000000000000	15000000.000000000000000000000000000000	1500000000.000000000000000000000000000000	2025-10-31 09:08:29.187
\.


--
-- Data for Name: order_preparations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_preparations (id, order_id, seller_id, preparation_started_at, preparation_completed_at, estimated_ready_date, container_inspection_completed, container_cleaned, container_repaired, documents_prepared, customs_cleared, inspection_photos_json, repair_photos_json, document_urls_json, preparation_notes, seller_notes, pickup_location_json, pickup_contact_name, pickup_contact_phone, pickup_instructions, pickup_available_from, pickup_available_to, status, created_at, updated_at) FROM stdin;
prep-1761022923348-zu7gkm	b0a8e8d1-624d-4f38-9cef-419d5ad49be2	user-seller	2025-10-21 05:02:03.348+00	2025-10-21 06:35:46.525+00	\N	f	f	f	f	f	\N	\N	\N	\N	\N	{"lat": "", "lng": "", "city": "Hồ Chí Minh", "address": "Khu vực cảng Sài Gòn, Quận 4, TP.HCM", "country": "Vietnam", "postalCode": ""}	Thái Dương	+84344964979	\N	2025-10-23 06:35:00+00	2025-10-25 06:35:00+00	READY	2025-10-21 05:02:03.35+00	2025-10-21 06:35:46.528634+00
prep-1761029970906-xuaa9e	6ce9b8c2-2c54-479a-8f2e-831c28ee58dd	user-seller	2025-10-21 06:59:30.906+00	2025-10-21 06:59:30.906+00	\N	f	f	f	f	f	\N	\N	\N	\N	\N	{"lat": "", "lng": "", "city": "QUANG NGAI", "address": "Khu công nghiệp Đình Vũ, Hải Phong", "country": "", "postalCode": ""}	cao thai duong	344964979	\N	2025-10-30 06:59:00+00	2025-10-31 06:59:00+00	READY	2025-10-21 06:59:30.908+00	2025-10-21 06:59:30.906+00
prep_1761038822051_qkd7nkxws	72682c91-7499-4f0c-85a6-b2f78a75dbcd	user-seller	2025-10-21 09:27:02.051+00	2025-10-21 09:27:26.931+00	2025-10-23 00:00:00+00	f	f	f	f	f	null	\N	null	đã kiểm tra 	tôt	{"lat": "", "lng": "", "city": "Hồ Chí Minh", "address": "Khu vực cảng Sài Gòn, Quận 4, TP.HCM", "country": "Vietnam", "postalCode": ""}	Thái Dương	+84344964979	ok	2025-10-23 09:27:00+00	2025-10-24 09:27:00+00	READY	2025-10-21 09:27:02.051+00	2025-10-21 09:27:26.935026+00
prep_1761101653632_cv824110u	745201cf-581b-4b4f-a173-718226677fec	user-seller	2025-10-22 02:54:13.632+00	2025-10-22 02:55:51.147+00	2025-10-24 00:00:00+00	f	f	f	f	f	null	\N	null	ok	ok	{"lat": "", "lng": "", "city": "Hồ Chí Minh", "address": "Khu công nghiệp Đình Vũ, Hải Phong", "country": "Vietnam", "postalCode": ""}	Thái Dương	+84344964979	\N	2025-10-24 02:55:00+00	2025-10-29 02:55:00+00	READY	2025-10-22 02:54:13.632+00	2025-10-22 02:55:51.149635+00
prep-1761102983961-gg53c8	a0a42cff-2996-4c53-a8fc-f062f11f8130	user-seller	2025-10-22 03:16:23.961+00	2025-10-22 03:16:23.961+00	\N	f	f	f	f	f	\N	\N	\N	\N	\N	{"lat": "", "lng": "", "city": "QUANG NGAI", "address": "Khu công nghiệp Trà Nóc, Cần Thơ", "country": "", "postalCode": ""}	cao thai duong	344964979	\N	2025-10-24 03:16:00+00	2025-10-29 03:16:00+00	READY	2025-10-22 03:16:23.963+00	2025-10-22 03:16:23.961+00
prep_1761194941829_f8zgyt5yz	a4d89d1a-d4de-4d09-9cb7-2360ad985799	user-seller	2025-10-23 04:49:01.829+00	2025-10-23 04:49:46.569+00	2025-10-24 00:00:00+00	f	f	f	f	f	null	\N	null	Chuân bị hàng 	đã kiểm tra 	{"lat": "", "lng": "", "city": "Hồ Chí Minh", "address": "Khu công nghiệp Đình Vũ, Hải Phong", "country": "Vietnam", "postalCode": ""}	Thái Dương	+84344964979	\N	2025-10-24 04:49:00+00	2025-10-25 04:49:00+00	READY	2025-10-23 04:49:01.829+00	2025-10-23 04:49:46.572328+00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, buyer_id, seller_id, listing_id, quote_id, org_ids, status, subtotal, tax, fees, total, currency, order_number, notes, created_at, updated_at, ready_date, delivered_at, completed_at, payment_verified_at, receipt_confirmed_at, receipt_confirmed_by, receipt_data_json) FROM stdin;
30e8218f-de1a-4a35-995b-57061d7f9fba	user-buyer	user-seller	2ae6fd5a-cef8-4baf-99f5-b7eb23e69bf0	5bce72dd-00ce-4d70-87f4-6c6855372924	\N	PENDING_PAYMENT	90000000.000000000000000000000000000000	9000000.000000000000000000000000000000	0.000000000000000000000000000000	99000000.000000000000000000000000000000	USD	ORD-1760583963400-CSQWI	\N	2025-10-16 03:06:03.403	2025-10-16 03:06:03.401	\N	\N	\N	\N	\N	\N	\N
152a6aa6-7423-4977-8910-acf1b97c5299	user-buyer	user-seller	2ae6fd5a-cef8-4baf-99f5-b7eb23e69bf0	5bce72dd-00ce-4d70-87f4-6c6855372924	\N	PENDING_PAYMENT	90000000.000000000000000000000000000000	9000000.000000000000000000000000000000	0.000000000000000000000000000000	99000000.000000000000000000000000000000	USD	ORD-1760584283864-YTL9Y	\N	2025-10-16 03:11:23.866	2025-10-16 03:11:23.864	\N	\N	\N	\N	\N	\N	\N
72682c91-7499-4f0c-85a6-b2f78a75dbcd	user-buyer	user-seller	136b5be7-fff8-4c95-b746-796b3128ada4	e7127e3f-d2cd-4a8e-8aa7-a0496f11237a	\N	COMPLETED	1680000000.000000000000000000000000000000	168000000.000000000000000000000000000000	0.000000000000000000000000000000	1848000000.000000000000000000000000000000	VND	ORD-1761032058331-5Y16B	\N	2025-10-21 07:34:18.334	2025-10-22 06:35:10.135	2025-10-21 09:27:26.941	2025-10-21 21:49:00	\N	2025-10-21 09:12:13.471	2025-10-22 06:35:10.135	user-buyer	{"notes": "", "photos": ["data:image/png;base64,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"], "condition": "GOOD", "signature": "", "received_at": "2025-10-22T06:35:10.124Z", "received_by": "ttttt", "confirmed_at": "2025-10-22T06:35:10.135Z"}
b0a8e8d1-624d-4f38-9cef-419d5ad49be2	user-buyer	user-seller	dce2d035-2f62-4fd3-aeaf-ada7de1e6dbe	ce6e59bb-1550-4b49-950d-f9ddc52a06cc	\N	DELIVERING	190000000.000000000000000000000000000000	19000000.000000000000000000000000000000	0.000000000000000000000000000000	209000000.000000000000000000000000000000	VND	ORD-1760754670933-VQE1I	\N	2025-10-18 02:31:10.95	2025-10-21 06:47:00.941	2025-10-21 06:35:46.535	\N	\N	\N	\N	\N	\N
6ce9b8c2-2c54-479a-8f2e-831c28ee58dd	user-buyer	user-seller	00dc48ed-5625-44ad-b600-038f569da9d7	fe6f03b4-ca2c-47e4-968e-818ec32e80b4	\N	DISPUTED	3400000000.000000000000000000000000000000	340000000.000000000000000000000000000000	0.000000000000000000000000000000	3740000000.000000000000000000000000000000	VND	ORD-1760953501239-U293P	\N	2025-10-20 09:45:01.243	2025-10-22 07:19:03.961	2025-10-21 06:59:30.916	2025-10-22 21:59:00	\N	\N	2025-10-22 07:19:03.961	user-buyer	{"notes": "không dúng như yêu cầu", "photos": ["data:image/png;base64,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gAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAAAGABAgAAAABYgAAAAAAAFiAAAAAAgAUIAAAA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", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnIAAAJyCAYAAABALi2VAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAACcpSURBVHja7N19jF3lfej731prv47HYwbb2OAWamS7kBJOpCAnIZyjGzW6VKkUqWkr3dNEitRWR0p1qlvpVr1qe9OjtEpVcVpFisJRaZM0uWmivBRCiwgO0NASl1enfmkMxDge8xJbGIPxvO2Zvfda6/xh9s7YGJKUGvba8/lIlsdjY+Bnz+zvPGut50nKsgwA3jiPPPLI9hdeeOHQ0aNHY35+PmZnZ2NxcTF6vV50u93odDqxtLQUS0tL0e/3Y3l5OZaWlmJ5eTm63W50u93o9/vx0ksvRZ7n0e12o9frRZ7nURRFREQkSTJ8m3+fJEmiLMv4rd/6rXtuvvnm/9NEGEU1IwD4j3HkyJHs5MmTVz733HNXz87Obl5eXp6YnZ3d/Pzzz28/ceLEjpMnT17+4osvTs3Ozkan04mIiG63Owy2iIiyLKPf70e/349GozGMs6IooizL4bdBpBVFEXmehy/KQcgB8GN48sknJ44dO3bN3NzcxqNHj+48dOjQe5577rnti4uL051Opzk/Pz9cUet0OjE3NzdccVu5SjZY8VkpTdPh24uLi8Nw+0kkSXLe3xsQcgCr0je/+c33PvLIIx86evTozuPHj1998uTJePbZZ+PUqVOxtLQ0jLBGoxERZ1bWut3uMKbSNI0sy6JWq521qpamaSRJMvxnBr8+SZJI0/Ss1bjzBdvK7we/x8rvASEHsGocOHBg85NPPvl/PP/881cePnz4vzz88MM37tu3L5aXl6PRaAzvYxusnJVlGVmWRZZlURTFMOoiItrtduR5Hv1+fxhkP4k8z1813lZGn2gDIQewKu3ateu9u3fv/m+PPfbYjUeOHJmamZmJ2dnZs4IpSZJYu3ZtFEUR3W73FSGV5/lZ0dVut2NycjKef/75swLs3BW0lStyg0uhg3/fyh8XRTF838rVt8F9dYCQA1gVvv3tb7/9wIED79+7d+8Hdu/efc0LL7wQp0+fHl6+XPnU52Clrdvtxuzs7PD9jUYjiqKIXq83/HVpmkav14uyLKPT6QwfZog4c1k1TdPh779yZe58q27DT9ArLsO+1qXV8/04SZLX/L0BIQdQCffcc8979u3b90v79u17/7Fjx644fvx4HDlyZLhFx8p70FauevV6vWGsDeJtsB3IILQGT5iu/GcHcRcRw99/5erZyvgbPHW6MsQG4Xa+FbdzY23lr3eJFYQcwFjYv3//lnvvvfd3Z2Zmdn73u9+9/siRI3Hy5MnhStlrPdV57vsHDy6c69zQWnnP2mvdD/dqkfbjhNjKXyPcACEHjI2DBw9u2LNnz3+9//77P7Jnz56rn3zyyVhaWjrrydHBJU4AIQcwAh566KGr//Iv//Lvv/zlL28fPF2aZdlZ96kNtvOweS4g5ADeZAcPHtxw++23/9k//MM//MbevXuj2WxGu90ebg9Sr9djYmJi+ETpuZczB/e3AQg5gDfI448/Pn3PPff87u233/4Hjz/+eMzOzg4fShgEWpZlZ73vfJxDCgg5gDfIfffdd/2uXbv+YO/evb946NCheOqpp6LRaAwfQmi328PD5Ac/HmzEO9ibbeXTqUIOEHIAF9idd975i//0T//024888siNe/bsicXFxZiYmIh2ux2dTieazWbUarVYWFiIiB8ek9XpdIZbhpx7T1ySJFGv18/7JCqAkAN4nQ4fPty8+eab77rjjjve8/3vf394BFZExPLycuR5Hq1WK5aWlobHZ0Wc2fttcEzWylCr1+uRpmn0+/3I81zEAUIO4EL4i7/4i0/81V/91e8cOnRo+L6VpxQM3l55rumPCrPXul8OQMgBvE5/8zd/8ztf+tKXPrFnz57hpVIAhBwwwp544ompW2655fa///u/f8+LL744PMcUACEHjLBvfOMbN37+85//3K5duzbPzs5GrVaLWs2nJgAhB4ysAwcObP7CF77wuX/8x3+8ce/evZEkyfBJVBv1Agg5YER9/vOf/+2Pf/zjn3zyyScjSZKo1WqRJEn0+/3h06cR4clSACEHjIqZmZnsj/7ojw797d/+7ZX1ej2azebw+KyyLM96MtXlVQAhB4yI+++//+2f/OQn77nrrrumBxvyLi0tRZIkw4BLkiRarVb0+30POwAIOWAU3Hnnnb/4hS984dP33Xff9OLiYiRJEouLi6/4dWVZRqfTMTBGwuBoNxBywKr15S9/+cOf+cxnPvfII4/E3NxcJEkSSZJEmqZnXUoFQMgBI+TP/uzP/tc3vvGNj3z729+O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"], "condition": "MAJOR_DAMAGE", "signature": "", "received_at": "2025-10-22T07:19:03.936Z", "received_by": "Nguyễn Văn Anh", "confirmed_at": "2025-10-22T07:19:03.961Z"}
c5b70504-95ff-43cd-89bd-15589e401bcc	user-buyer	user-seller	2ae6fd5a-cef8-4baf-99f5-b7eb23e69bf0	5bce72dd-00ce-4d70-87f4-6c6855372924	\N	PAID	90000000.000000000000000000000000000000	9000000.000000000000000000000000000000	0.000000000000000000000000000000	99000000.000000000000000000000000000000	USD	ORD-1760585965384-E6DG7	\N	2025-10-16 03:39:25.387	2025-10-16 03:39:25.385	\N	\N	\N	\N	\N	\N	\N
6a6330ca-ea0f-44b1-afba-75929232f31f	user-buyer	user-seller	2ae6fd5a-cef8-4baf-99f5-b7eb23e69bf0	5bce72dd-00ce-4d70-87f4-6c6855372924	\N	PAID	90000000.000000000000000000000000000000	9000000.000000000000000000000000000000	0.000000000000000000000000000000	99000000.000000000000000000000000000000	USD	ORD-1760587359501-KSSNV	\N	2025-10-16 04:02:39.503	2025-10-16 04:02:39.501	\N	\N	\N	\N	\N	\N	\N
test-order-1760607594265	640a4460-4cea-4edb-b5dc-32b8cad6360c	640a4460-4cea-4edb-b5dc-32b8cad6360c	\N	\N	\N	PAID	1000000.000000000000000000000000000000	100000.000000000000000000000000000000	0.000000000000000000000000000000	1100000.000000000000000000000000000000	VND	TEST-1760607594265	\N	2025-10-16 09:39:54.265	2025-10-16 09:39:54.265	\N	\N	\N	\N	\N	\N	\N
87937cd4-cd5c-45a2-b285-995d3b1f7c1a	user-buyer	user-seller	cbdb7804-e0b9-4d05-aff8-4588d3a366d4	7eb10bb2-5bb6-472a-8bc8-0b1ac61c7390	\N	PAID	270000000.000000000000000000000000000000	27000000.000000000000000000000000000000	0.000000000000000000000000000000	297000000.000000000000000000000000000000	USD	ORD-1760584102009-EVZQA	\N	2025-10-16 03:08:22.01	2025-10-16 03:08:22.009	\N	\N	\N	\N	\N	\N	\N
order-1760580381640-oehwce3k0	user-buyer	user-seller	\N	37d651cd-5b1b-4be7-b31e-90b27c78683b	\N	PAID	600000000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	600000000.000000000000000000000000000000	USD	ORD-1760580381640-uhc5iyojf	\N	2025-10-16 02:06:21.641	2025-10-16 02:06:21.641	\N	\N	\N	\N	\N	\N	\N
order-1760515673064-r3elbetv7	user-buyer	user-seller	\N	f0e586ff-d21c-48dc-8944-4d7a14edca42	\N	PAID	2700000000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	2700000000.000000000000000000000000000000	USD	ORD-1760515673064-3k2xt6wk9	\N	2025-10-15 08:07:53.065	2025-10-21 08:14:20.899	\N	\N	\N	2025-10-21 08:14:20.899	\N	\N	\N
a4d89d1a-d4de-4d09-9cb7-2360ad985799	user-buyer	user-seller	6e5e38f3-7a09-4b6f-ac03-1f92b192aea8	ab10ea61-92e5-4a16-be4a-f55fe0acedef	\N	COMPLETED	15000000000.000000000000000000000000000000	1500000000.000000000000000000000000000000	0.000000000000000000000000000000	16500000000.000000000000000000000000000000	VND	ORD-1761194739715-TW2FN	\N	2025-10-23 04:45:39.717	2025-10-23 05:15:20.735	2025-10-23 04:49:46.585	2025-10-23 22:06:00	\N	2025-10-23 04:48:24.861	2025-10-23 05:15:20.735	user-buyer	{"notes": "", "photos": ["data:image/jpeg;base64,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", "data:image/jpeg;base64,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"], "condition": "GOOD", "signature": "", "received_at": "2025-10-23T05:15:20.725Z", "received_by": "Nguyễn Văn Anh", "confirmed_at": "2025-10-23T05:15:20.735Z"}
order-1760579400569-r3w46fegd	user-buyer	user-seller	\N	9316515d-8cbc-4811-8f98-30191871b44d	\N	PAID	240000000.000000000000000000000000000000	0.000000000000000000000000000000	0.000000000000000000000000000000	240000000.000000000000000000000000000000	USD	ORD-1760579400569-f3dxm9k64	\N	2025-10-16 01:50:00.571	2025-10-21 08:16:20.286	\N	\N	\N	2025-10-21 08:16:20.286	\N	\N	\N
a0a42cff-2996-4c53-a8fc-f062f11f8130	user-buyer	user-seller	2ae6fd5a-cef8-4baf-99f5-b7eb23e69bf0	5bce72dd-00ce-4d70-87f4-6c6855372924	\N	TRANSPORTATION_BOOKED	90000000.000000000000000000000000000000	9000000.000000000000000000000000000000	0.000000000000000000000000000000	99000000.000000000000000000000000000000	USD	ORD-1760587932428-JK221	\N	2025-10-16 04:12:12.429	2025-10-22 03:16:58.029	2025-10-22 03:16:23.971	\N	\N	\N	\N	\N	\N
31123a4d-db53-41e5-b135-3a4a81e62d84	user-buyer	user-seller	2ae6fd5a-cef8-4baf-99f5-b7eb23e69bf0	5bce72dd-00ce-4d70-87f4-6c6855372924	\N	PAID	90000000.000000000000000000000000000000	9000000.000000000000000000000000000000	0.000000000000000000000000000000	99000000.000000000000000000000000000000	USD	ORD-1760583718816-4Q1A7	\N	2025-10-16 03:01:58.819	2025-10-21 08:17:00.042	\N	\N	\N	2025-10-21 08:17:00.042	\N	\N	\N
411ae9fe-1219-47a3-aa56-7d344035d27a	user-buyer	user-seller	4988d8f6-b8e4-4298-be96-b084d5c8cd10	b8cca11d-9997-45fe-b4ad-f88de9746e0f	\N	PAYMENT_PENDING_VERIFICATION	1500000000.000000000000000000000000000000	150000000.000000000000000000000000000000	0.000000000000000000000000000000	1650000000.000000000000000000000000000000	VND	ORD-1761901709184-VLE8M	\N	2025-10-31 09:08:29.187	2025-10-31 09:08:29.185	\N	\N	\N	\N	\N	\N	\N
745201cf-581b-4b4f-a173-718226677fec	user-buyer	user-seller	00dc48ed-5625-44ad-b600-038f569da9d7	23578379-2f03-485f-9d10-a55accc5fac8	\N	DELIVERED	480000000.000000000000000000000000000000	48000000.000000000000000000000000000000	0.000000000000000000000000000000	528000000.000000000000000000000000000000	VND	ORD-1760942564960-CXWVX	\N	2025-10-20 06:42:44.973	2025-10-22 04:36:32.833	2025-10-22 02:55:52.519	2025-10-21 21:36:00	\N	\N	2025-10-22 13:16:57.792352	user-buyer	{"notes": "Container OK", "photos": [], "condition": "GOOD", "received_by": "Test User"}
\.


--
-- Data for Name: org_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org_users (id, org_id, user_id, role_in_org, permissions, joined_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: orgs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orgs (id, name, tax_code, kyb_status, owner_user_id, business_type, registration_number, address, province, contact_person, contact_phone, contact_email, website, description, logo_url, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partners (id, type, name, contact_json, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_methods (id, code, provider, method_type, enabled, config_json, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, provider, method, status, escrow_account_ref, amount, currency, transaction_id, gateway_response, paid_at, created_at, updated_at, escrow_hold_until, released_at, verified_at, verified_by, notes) FROM stdin;
PAY-1760589470030-8130	a0a42cff-2996-4c53-a8fc-f062f11f8130	BANK_TRANSFER	BANK_TRANSFER	COMPLETED	ESCROW-1761032407540-f11f8130	99000000.000000000000000000000000000000	USD	TXN-1761032407540-UB22AM7SB	\N	2025-10-16 04:37:50.03	2025-10-16 04:37:50.032	2025-10-21 07:40:07.54	2025-11-20 07:40:07.54	\N	\N	\N	\N
PAY-1760589496729-f31f	6a6330ca-ea0f-44b1-afba-75929232f31f	BANK_TRANSFER	BANK_TRANSFER	COMPLETED	ESCROW-1761032407547-9232f31f	99000000.000000000000000000000000000000	USD	TXN-1761032407547-496RYNO46	\N	2025-10-16 04:38:16.729	2025-10-16 04:38:16.732	2025-10-21 07:40:07.547	2025-11-20 07:40:07.547	\N	\N	\N	\N
PAY-1760756920122-9be2	b0a8e8d1-624d-4f38-9cef-419d5ad49be2	VNPAY	EWALLET	COMPLETED	ESCROW-1761032407552-5ad49be2	209000000.000000000000000000000000000000	VND	TXN-1761032407552-QVWBP325Z	\N	2025-10-18 03:08:40.122	2025-10-18 03:08:40.124	2025-10-21 07:47:58.297	2025-11-20 07:40:07.552	\N	\N	\N	\N
PAY-1760953511189-58dd	6ce9b8c2-2c54-479a-8f2e-831c28ee58dd	VNPAY	EWALLET	COMPLETED	ESCROW-1761032407555-28ee58dd	3740000000.000000000000000000000000000000	VND	TXN-1761032407555-0QOS50QFA	\N	2025-10-20 09:45:11.189	2025-10-20 09:45:11.191	2025-10-21 07:47:58.304	2025-11-20 07:40:07.555	\N	\N	\N	\N
PAY-1761032117337-7fec	745201cf-581b-4b4f-a173-718226677fec	VNPAY	EWALLET	COMPLETED	ESCROW-1761032407564-26677fec	528000000.000000000000000000000000000000	VND	TXN-1761032407564-5299L51XV	\N	2025-10-21 07:35:17.337	2025-10-21 07:35:17.338	2025-10-21 07:47:58.31	2025-11-20 07:40:07.564	\N	\N	\N	\N
PAY-1761033250398-1bcc	c5b70504-95ff-43cd-89bd-15589e401bcc	VNPAY	CARD	COMPLETED	\N	101873000.000000000000000000000000000000	USD	\N	\N	2025-10-21 07:54:10.398	2025-10-21 07:54:10.402	2025-10-21 07:54:10.398	\N	\N	\N	\N	\N
PAY-1761033279574-7c1a	87937cd4-cd5c-45a2-b285-995d3b1f7c1a	VNPAY	CARD	COMPLETED	\N	305615000.000000000000000000000000000000	USD	\N	\N	2025-10-21 07:54:39.574	2025-10-21 07:54:39.576	2025-10-21 07:54:39.574	\N	\N	\N	\N	\N
PAY-1761033321541-e3k0	order-1760580381640-oehwce3k0	VNPAY	CARD	COMPLETED	\N	617402000.000000000000000000000000000000	USD	\N	\N	2025-10-21 07:55:21.541	2025-10-21 07:55:21.542	2025-10-21 07:55:21.541	\N	\N	\N	\N	\N
PAY-1761034460744-etv7	order-1760515673064-r3elbetv7	BANK_TRANSFER	BANK_TRANSFER	COMPLETED	\N	2700000000.000000000000000000000000000000	USD	\N	\N	2025-10-21 08:14:20.745	2025-10-21 08:14:20.745	2025-10-21 08:14:20.893	\N	\N	2025-10-21 08:14:20.893	user-seller	Test verification: Payment confirmed by seller
PAY-1761034580263-fegd	order-1760579400569-r3w46fegd	BANK_TRANSFER	BANK_TRANSFER	COMPLETED	\N	240000000.000000000000000000000000000000	USD	\N	\N	2025-10-21 08:16:20.263	2025-10-21 08:16:20.263	2025-10-21 08:16:20.283	\N	\N	2025-10-21 08:16:20.283	user-seller	Test verification: Payment confirmed by seller
PAY-1761034620012-2d84	31123a4d-db53-41e5-b135-3a4a81e62d84	BANK_TRANSFER	BANK_TRANSFER	COMPLETED	\N	99000000.000000000000000000000000000000	USD	\N	\N	2025-10-21 08:17:00.013	2025-10-21 08:17:00.013	2025-10-21 08:17:00.038	\N	\N	2025-10-21 08:17:00.038	user-seller	Test verification: Payment confirmed by seller
PAY-1761032104318-dbcd	72682c91-7499-4f0c-85a6-b2f78a75dbcd	VNPAY	EWALLET	COMPLETED	ESCROW-1761032407560-8a75dbcd	1848000000.000000000000000000000000000000	VND	TXN-1761032407560-R2XS6VRBV	\N	2025-10-21 07:35:04.318	2025-10-21 07:35:04.321	2025-10-21 09:12:13.349	2025-11-20 07:40:07.56	\N	2025-10-21 09:12:13.349	user-seller	Đã nhận đủ tiền
PAY-1761194840100-5799	a4d89d1a-d4de-4d09-9cb7-2360ad985799	VNPAY	CARD	COMPLETED	\N	16978502000.000000000000000000000000000000	VND	\N	\N	2025-10-23 04:47:20.1	2025-10-23 04:47:20.102	2025-10-23 04:48:24.856	\N	\N	2025-10-23 04:48:24.856	user-seller	đã nhận 
PAY-1761903034984-d27a	411ae9fe-1219-47a3-aa56-7d344035d27a	VNPAY	CARD	PENDING	\N	1697852000.000000000000000000000000000000	VND	\N	\N	2025-10-31 09:30:34.984	2025-10-31 09:30:34.986	2025-10-31 09:30:34.984	\N	\N	\N	\N	\N
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, code, name, description, category, created_at, updated_at) FROM stdin;
perm-pm-012	PM-012	PUBLISH_LISTING	Gửi duyệt/Xuất bản tin	listings	2025-10-09 07:25:05.082	2025-10-09 07:25:05.082
perm-pm-013	PM-013	ARCHIVE_LISTING	Ẩn/Lưu trữ tin	listings	2025-10-09 07:25:05.083	2025-10-09 07:25:05.083
perm-pm-024	PM-024	REDACTION_ENFORCE	Thực thi che thông tin liên hệ	moderation	2025-10-09 07:25:05.091	2025-10-09 07:25:05.091
perm-pm-050	PM-050	RATE_AND_REVIEW	Đánh giá sau giao dịch	reviews	2025-10-09 07:25:05.099	2025-10-09 07:25:05.099
perm-pm-060	PM-060	FILE_DISPUTE	Khiếu nại	disputes	2025-10-09 07:25:05.099	2025-10-09 07:25:05.099
perm-pm-061	PM-061	RESOLVE_DISPUTE	Xử lý tranh chấp	disputes	2025-10-09 07:25:05.1	2025-10-09 07:25:05.1
perm-pm-070	PM-070	ADMIN_REVIEW_LISTING	Duyệt tin đăng	admin	2025-10-09 07:25:05.101	2025-10-09 07:25:05.101
perm-pm-071	PM-071	ADMIN_MANAGE_USERS	Quản lý người dùng/vai trò	admin	2025-10-09 07:25:05.102	2025-10-09 07:25:05.102
perm-pm-072	PM-072	ADMIN_VIEW_DASHBOARD	Xem KPI dashboard	admin	2025-10-09 07:25:05.103	2025-10-09 07:25:05.103
perm-pm-073	PM-073	ADMIN_CONFIG_PRICING	Cấu hình phí, gói	admin	2025-10-09 07:25:05.103	2025-10-09 07:25:05.103
perm-pm-074	PM-074	MANAGE_PRICE_RULES	Quản lý Pricing Rules/price band	pricing	2025-10-09 07:25:05.104	2025-10-09 07:25:05.104
perm-pm-080	PM-080	DEPOT_CREATE_JOB	Tạo lệnh việc depot	depot	2025-10-09 07:25:05.105	2025-10-09 07:25:05.105
perm-pm-081	PM-081	DEPOT_UPDATE_JOB	Cập nhật công việc depot	depot	2025-10-09 07:25:05.106	2025-10-09 07:25:05.106
perm-pm-082	PM-082	DEPOT_ISSUE_EIR	Lập EIR	depot	2025-10-09 07:25:05.106	2025-10-09 07:25:05.107
perm-pm-083	PM-083	DEPOT_VIEW_STOCK	Xem tồn kho depot	depot	2025-10-09 07:25:05.107	2025-10-09 07:25:05.107
perm-pm-084	PM-084	DEPOT_VIEW_MOVEMENTS	Xem nhật ký nhập-xuất-chuyển	depot	2025-10-09 07:25:05.108	2025-10-09 07:25:05.108
perm-pm-085	PM-085	DEPOT_ADJUST_STOCK	Điều chỉnh tồn (manual IN/OUT)	depot	2025-10-09 07:25:05.11	2025-10-09 07:25:05.11
perm-pm-086	PM-086	DEPOT_TRANSFER_STOCK	Chuyển giữa các Depot	depot	2025-10-09 07:25:05.111	2025-10-09 07:25:05.111
perm-pm-090	PM-090	FINANCE_RECONCILE	Đối soát/giải ngân	finance	2025-10-09 07:25:05.112	2025-10-09 07:25:05.112
perm-pm-091	PM-091	FINANCE_INVOICE	Xuất hóa đơn	finance	2025-10-09 07:25:05.113	2025-10-09 07:25:05.113
perm-pm-100	PM-100	CS_MANAGE_TICKETS	Xử lý yêu cầu hỗ trợ	support	2025-10-09 07:25:05.114	2025-10-09 07:25:05.114
perm-pm-110	PM-110	CONFIG_NAMESPACE_RW	Tạo/sửa namespace cấu hình	config	2025-10-09 07:25:05.115	2025-10-09 07:25:05.115
perm-pm-111	PM-111	CONFIG_ENTRY_RW	Tạo/sửa entry cấu hình	config	2025-10-09 07:25:05.115	2025-10-09 07:25:05.115
perm-pm-112	PM-112	CONFIG_PUBLISH	Phát hành cấu hình, rollback phiên bản	config	2025-10-09 07:25:05.116	2025-10-09 07:25:05.116
perm-pm-113	PM-113	FEATURE_FLAG_RW	Quản lý feature flags/rollout	config	2025-10-09 07:25:05.117	2025-10-09 07:25:05.117
perm-pm-114	PM-114	TAX_RATE_RW	Quản lý thuế	config	2025-10-09 07:25:05.118	2025-10-09 07:25:05.118
perm-pm-115	PM-115	FEE_SCHEDULE_RW	Quản lý biểu phí	config	2025-10-09 07:25:05.119	2025-10-09 07:25:05.119
perm-pm-116	PM-116	COMMISSION_RULE_RW	Quản lý hoa hồng	config	2025-10-09 07:25:05.12	2025-10-09 07:25:05.12
perm-pm-117	PM-117	TEMPLATE_RW	Quản lý template thông báo	config	2025-10-09 07:25:05.121	2025-10-09 07:25:05.121
perm-pm-118	PM-118	I18N_RW	Quản lý từ điển i18n	config	2025-10-09 07:25:05.122	2025-10-09 07:25:05.122
perm-pm-119	PM-119	FORM_SCHEMA_RW	Quản lý biểu mẫu (JSON Schema)	config	2025-10-09 07:25:05.123	2025-10-09 07:25:05.123
perm-pm-120	PM-120	SLA_RW	Quản lý SLA	config	2025-10-09 07:25:05.123	2025-10-09 07:25:05.123
perm-pm-121	PM-121	BUSINESS_HOURS_RW	Quản lý lịch làm việc	config	2025-10-09 07:25:05.124	2025-10-09 07:25:05.124
perm-pm-122	PM-122	DEPOT_CALENDAR_RW	Quản lý lịch đóng Depot	config	2025-10-09 07:25:05.125	2025-10-09 07:25:05.125
perm-pm-123	PM-123	INTEGRATION_CONFIG_RW	Quản lý cấu hình tích hợp (vendor)	config	2025-10-09 07:25:05.127	2025-10-09 07:25:05.127
perm-pm-124	PM-124	PAYMENT_METHOD_RW	Quản lý phương thức thanh toán	config	2025-10-09 07:25:05.128	2025-10-09 07:25:05.128
perm-pm-125	PM-125	PARTNER_RW	Quản lý đối tác (carrier/insurer/PSP/DMS)	config	2025-10-09 07:25:05.129	2025-10-09 07:25:05.129
01ebfa09-f075-4592-b0da-03da3436067b	PM-999	Test Permission	Permission test để demo cơ chế dynamic	SYSTEM	2025-10-25 04:23:54.741	2025-10-25 04:23:54.738
perm-pm-001	PM-001	VIEW_PUBLIC_LISTINGS	Xem tin công khai	listings	2025-10-09 07:25:04.99	2025-10-09 07:25:04.99
perm-pm-002	PM-002	SEARCH_LISTINGS	Tìm kiếm, lọc tin	listings	2025-10-09 07:25:05.075	2025-10-09 07:25:05.075
perm-pm-003	PM-003	VIEW_SELLER_PROFILE	Xem hồ sơ người bán	users	2025-10-09 07:25:05.077	2025-10-09 07:25:05.077
perm-pm-010	PM-010	CREATE_LISTING	Tạo tin đăng	listings	2025-10-09 07:25:05.079	2025-10-09 07:25:05.079
perm-pm-011	PM-011	EDIT_LISTING	Sửa tin đăng	listings	2025-10-09 07:25:05.081	2025-10-09 07:25:05.081
perm-pm-014	PM-014	DELETE_LISTING	Xóa tin đăng	listings	2025-10-09 07:25:05.085	2025-10-09 07:25:05.085
perm-pm-020	PM-020	CREATE_RFQ	Tạo RFQ (yêu cầu báo giá)	rfq	2025-10-09 07:25:05.086	2025-10-09 07:25:05.086
perm-pm-021	PM-021	ISSUE_QUOTE	Phát hành báo giá	quotes	2025-10-09 07:25:05.088	2025-10-09 07:25:05.088
perm-pm-022	PM-022	VIEW_QUOTES	Xem/so sánh báo giá	quotes	2025-10-09 07:25:05.089	2025-10-09 07:25:05.089
perm-pm-023	PM-023	MANAGE_QA	Quản lý Q&A có kiểm duyệt	qa	2025-10-09 07:25:05.09	2025-10-09 07:25:05.09
perm-pm-030	PM-030	REQUEST_INSPECTION	Yêu cầu giám định	inspection	2025-10-09 07:25:05.092	2025-10-09 07:25:05.092
perm-pm-031	PM-031	VIEW_INSPECTION_REPORT	Xem báo cáo giám định	inspection	2025-10-09 07:25:05.094	2025-10-09 07:25:05.094
perm-pm-040	PM-040	CREATE_ORDER	Tạo đơn hàng	orders	2025-10-09 07:25:05.095	2025-10-09 07:25:05.095
perm-pm-041	PM-041	PAY_ESCROW	Thanh toán ký quỹ	payments	2025-10-09 07:25:05.096	2025-10-09 07:25:05.096
perm-pm-042	PM-042	REQUEST_DELIVERY	Yêu cầu vận chuyển	delivery	2025-10-09 07:25:05.097	2025-10-09 07:25:05.097
perm-pm-043	PM-043	CONFIRM_RECEIPT	Xác nhận nhận hàng	orders	2025-10-09 07:25:05.098	2025-10-09 07:25:05.098
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plans (id, code, name, description, price, currency, cycle, features, max_listings, max_rfqs, priority_support, status, created_at, updated_at) FROM stdin;
2e4360c9-f78d-458d-82ed-b25205e2a1a2	FREE	Miễn phí	Gói miễn phí cơ bản	0.000000000000000000000000000000	VND	MONTHLY	"[\\"Đăng tối đa 5 tin\\",\\"Tạo tối đa 3 RFQ\\",\\"Hỗ trợ email\\"]"	5	3	f	active	2025-10-09 07:51:30.614	2025-10-09 07:51:30.612
94eb03ee-1361-4db3-a798-cb0a6375ef31	BASIC	Cơ bản	Gói cơ bản cho doanh nghiệp nhỏ	500000.000000000000000000000000000000	VND	MONTHLY	"[\\"Đăng tối đa 50 tin\\",\\"Tạo tối đa 20 RFQ\\",\\"Hỗ trợ chat\\",\\"Báo cáo cơ bản\\"]"	50	20	f	active	2025-10-09 07:51:30.614	2025-10-09 07:51:30.612
44bad7dc-d53c-4fdf-8794-9cb7adad1b9b	PREMIUM	Cao cấp	Gói cao cấp cho doanh nghiệp vừa	2000000.000000000000000000000000000000	VND	MONTHLY	"[\\"Đăng không giới hạn tin\\",\\"RFQ không giới hạn\\",\\"Hỗ trợ ưu tiên\\",\\"Báo cáo chi tiết\\",\\"API access\\"]"	200	100	t	active	2025-10-09 07:51:30.614	2025-10-09 07:51:30.612
ceca7624-3101-4474-af08-d4128f53393f	ENTERPRISE	Doanh nghiệp	Gói doanh nghiệp lớn	5000000.000000000000000000000000000000	VND	MONTHLY	"[\\"Không giới hạn tính năng\\",\\"Hỗ trợ 24/7\\",\\"Custom integration\\",\\"Dedicated account manager\\"]"	\N	\N	t	active	2025-10-09 07:51:30.614	2025-10-09 07:51:30.612
\.


--
-- Data for Name: qa_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qa_answers (id, question_id, responder_id, answer, moderated, moderated_by, moderated_at, created_at) FROM stdin;
\.


--
-- Data for Name: qa_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qa_questions (id, rfq_id, author_id, question, moderated, moderated_by, moderated_at, created_at) FROM stdin;
\.


--
-- Data for Name: quote_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quote_items (id, quote_id, item_type, ref_id, description, qty, unit_price, total_price, created_at) FROM stdin;
59329da7-8fb4-4c40-b367-d2de66ace3b6	f0e586ff-d21c-48dc-8944-4d7a14edca42	CONTAINER	b8976813-52e4-4065-bf32-55ce05ab3265	Standard - 20ft	15.000000000000000000000000000000	180000000.000000000000000000000000000000	2700000000.000000000000000000000000000000	2025-10-14 06:26:05.483
25885e58-b57f-4c68-9ae7-a513704f29b2	5bce72dd-00ce-4d70-87f4-6c6855372924	CONTAINER	cb2d73f1-5348-403d-a060-b9b835d7f881	Standard - 20ft	10.000000000000000000000000000000	9000000.000000000000000000000000000000	90000000.000000000000000000000000000000	2025-10-15 02:08:06.117
26d322d7-3f6c-4a13-9cc1-1523f8345a86	9316515d-8cbc-4811-8f98-30191871b44d	CONTAINER	e8b693ed-0ccc-4b1a-872d-e1249e59f1b4	Standard - 20ft	10.000000000000000000000000000000	24000000.000000000000000000000000000000	240000000.000000000000000000000000000000	2025-10-15 05:16:22.285
5a953108-5278-41f2-87f7-012206dfb137	37d651cd-5b1b-4be7-b31e-90b27c78683b	CONTAINER	a8f5af5d-3072-49b3-975d-3d8b9cb45399	Standard - 20ft	20.000000000000000000000000000000	30000000.000000000000000000000000000000	600000000.000000000000000000000000000000	2025-10-16 01:59:39.542
688d887d-e072-46cd-848d-38480db959bb	7eb10bb2-5bb6-472a-8bc8-0b1ac61c7390	CONTAINER	70ec4610-ac7e-47bd-902f-efe2b77904a8	Standard - 20ft	15.000000000000000000000000000000	18000000.000000000000000000000000000000	270000000.000000000000000000000000000000	2025-10-16 02:24:00.154
e069f1c0-a19a-45e5-bfe1-5c36449e3f38	ce6e59bb-1550-4b49-950d-f9ddc52a06cc	CONTAINER	688f02af-2964-41a0-a11d-a9cd1c440da8	Container - Standard 20ft	10.000000000000000000000000000000	19000000.000000000000000000000000000000	190000000.000000000000000000000000000000	2025-10-18 02:27:01.776
3713340b-82bf-410c-aa06-e30b9c59c619	23578379-2f03-485f-9d10-a55accc5fac8	CONTAINER	3669265c-baad-4507-a903-b65f710a42b6	Container - Standard 20ft	15.000000000000000000000000000000	32000000.000000000000000000000000000000	480000000.000000000000000000000000000000	2025-10-20 06:40:19.755
324c8937-111b-427f-b9a7-47d90e688619	4f2ee5b9-1b8a-429a-8319-7894baeddc5d	CONTAINER	8df487cd-f06c-4f05-a34a-7b2d4d954df6	Container - Standard 20ft	10.000000000000000000000000000000	18000000.000000000000000000000000000000	180000000.000000000000000000000000000000	2025-10-20 08:24:00.859
3d22e745-655b-4ed7-ac28-7384f38dd906	fe6f03b4-ca2c-47e4-968e-818ec32e80b4	CONTAINER	154aff95-b692-4ef5-82df-de703e3ced7e	Container - Standard 20ft	100.000000000000000000000000000000	34000000.000000000000000000000000000000	3400000000.000000000000000000000000000000	2025-10-20 08:41:19.315
ba7fa903-3d65-425f-9b56-19df03326ade	c4a64da1-3ed3-4ba5-8e2a-a6ab13d7c23b	CONTAINER	08b49e0e-b3a1-4d84-b37d-0729961dad81	Container - Standard 20ft	50.000000000000000000000000000000	340000000.000000000000000000000000000000	17000000000.000000000000000000000000000000	2025-10-20 08:48:02.058
db7c03ec-ac24-4afa-a009-7b4a1be3603d	e7127e3f-d2cd-4a8e-8aa7-a0496f11237a	CONTAINER	36eeea65-c5ad-47e5-9452-57d1db810e0f	Container - Standard 20ft	70.000000000000000000000000000000	24000000.000000000000000000000000000000	1680000000.000000000000000000000000000000	2025-10-20 09:16:03.768
2f79a7b7-2303-4b00-8a02-5c2cf01732c4	ab10ea61-92e5-4a16-be4a-f55fe0acedef	CONTAINER	65bcd8c8-d8ef-4b9f-8518-1df7f85d5e56	Container - FR 40ft	50.000000000000000000000000000000	300000000.000000000000000000000000000000	15000000000.000000000000000000000000000000	2025-10-23 04:45:08.577
76828b69-2d1d-41ab-a5f3-c252e5dc9f53	b8cca11d-9997-45fe-b4ad-f88de9746e0f	CONTAINER	9708c22a-c425-4bd4-9af8-525d6d15688e	Container - FR 40ft	100.000000000000000000000000000000	15000000.000000000000000000000000000000	1500000000.000000000000000000000000000000	2025-10-31 08:48:40.362
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotes (id, rfq_id, seller_id, price_subtotal, fees_json, total, currency, valid_until, status, notes, created_at, updated_at) FROM stdin;
5bce72dd-00ce-4d70-87f4-6c6855372924	cb2d73f1-5348-403d-a060-b9b835d7f881	user-seller	90000000.000000000000000000000000000000	[]	90000000.000000000000000000000000000000	USD	2025-10-30 00:00:00	ACCEPTED	\N	2025-10-15 02:08:06.117	2025-10-15 02:08:06.115
ce6e59bb-1550-4b49-950d-f9ddc52a06cc	688f02af-2964-41a0-a11d-a9cd1c440da8	user-seller	190000000.000000000000000000000000000000	[]	190000000.000000000000000000000000000000	VND	2025-10-30 02:27:01.772	ACCEPTED	\N	2025-10-18 02:27:01.776	2025-10-18 02:27:01.775
23578379-2f03-485f-9d10-a55accc5fac8	3669265c-baad-4507-a903-b65f710a42b6	user-seller	480000000.000000000000000000000000000000	[]	480000000.000000000000000000000000000000	VND	2025-10-30 06:40:19.746	ACCEPTED	\N	2025-10-20 06:40:19.755	2025-10-20 06:40:19.753
4f2ee5b9-1b8a-429a-8319-7894baeddc5d	8df487cd-f06c-4f05-a34a-7b2d4d954df6	user-seller	180000000.000000000000000000000000000000	[]	180000000.000000000000000000000000000000	VND	2025-10-30 08:24:00.848	SUBMITTED	\N	2025-10-20 08:24:00.859	2025-10-20 08:24:00.857
f0e586ff-d21c-48dc-8944-4d7a14edca42	b8976813-52e4-4065-bf32-55ce05ab3265	user-seller	2700000000.000000000000000000000000000000	[]	2700000000.000000000000000000000000000000	USD	2025-10-28 00:00:00	ACCEPTED	\N	2025-10-14 06:26:05.483	2025-10-15 08:07:53.059
c4a64da1-3ed3-4ba5-8e2a-a6ab13d7c23b	08b49e0e-b3a1-4d84-b37d-0729961dad81	user-seller	17000000000.000000000000000000000000000000	[]	17000000000.000000000000000000000000000000	VND	2025-10-31 08:48:02.05	SUBMITTED	\N	2025-10-20 08:48:02.058	2025-10-20 08:48:02.056
fe6f03b4-ca2c-47e4-968e-818ec32e80b4	154aff95-b692-4ef5-82df-de703e3ced7e	user-seller	3400000000.000000000000000000000000000000	[]	3400000000.000000000000000000000000000000	VND	2025-10-31 08:41:19.307	ACCEPTED	\N	2025-10-20 08:41:19.315	2025-10-20 08:41:19.314
9316515d-8cbc-4811-8f98-30191871b44d	e8b693ed-0ccc-4b1a-872d-e1249e59f1b4	user-seller	240000000.000000000000000000000000000000	[]	240000000.000000000000000000000000000000	USD	2025-10-31 00:00:00	ACCEPTED	\N	2025-10-15 05:16:22.285	2025-10-16 01:50:00.564
e7127e3f-d2cd-4a8e-8aa7-a0496f11237a	36eeea65-c5ad-47e5-9452-57d1db810e0f	user-seller	1680000000.000000000000000000000000000000	[]	1680000000.000000000000000000000000000000	VND	2025-10-31 09:16:03.759	ACCEPTED	\N	2025-10-20 09:16:03.768	2025-10-20 09:16:03.766
37d651cd-5b1b-4be7-b31e-90b27c78683b	a8f5af5d-3072-49b3-975d-3d8b9cb45399	user-seller	600000000.000000000000000000000000000000	[]	600000000.000000000000000000000000000000	USD	2025-10-30 00:00:00	ACCEPTED	\N	2025-10-16 01:59:39.542	2025-10-16 02:06:21.633
ab10ea61-92e5-4a16-be4a-f55fe0acedef	65bcd8c8-d8ef-4b9f-8518-1df7f85d5e56	user-seller	15000000000.000000000000000000000000000000	[]	15000000000.000000000000000000000000000000	VND	2025-10-30 04:45:08.567	ACCEPTED	\N	2025-10-23 04:45:08.577	2025-10-23 04:45:08.575
b8cca11d-9997-45fe-b4ad-f88de9746e0f	9708c22a-c425-4bd4-9af8-525d6d15688e	user-seller	1500000000.000000000000000000000000000000	[]	1500000000.000000000000000000000000000000	VND	2025-11-20 08:48:40.355	ACCEPTED	\N	2025-10-31 08:48:40.362	2025-10-31 08:48:40.36
7eb10bb2-5bb6-472a-8bc8-0b1ac61c7390	70ec4610-ac7e-47bd-902f-efe2b77904a8	user-seller	270000000.000000000000000000000000000000	[]	270000000.000000000000000000000000000000	USD	2025-10-31 00:00:00	ACCEPTED	\N	2025-10-16 02:24:00.154	2025-10-16 02:24:00.152
\.


--
-- Data for Name: redaction_patterns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.redaction_patterns (id, code, pattern, description, channel, enabled, severity, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: repair_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repair_items (id, repair_id, item_code, description, qty, unit_price, total_price, note, before_photo, after_photo, created_at) FROM stdin;
\.


--
-- Data for Name: repairs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repairs (id, inspection_id, depot_id, quote_amount, actual_amount, status, description, started_at, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, order_id, reviewer_id, reviewee_id, rating, comment, response, response_by, response_at, moderated, moderated_by, moderated_at, created_at, updated_at) FROM stdin;
f544e75c-1596-4a48-8a11-d71d6fbf6585	72682c91-7499-4f0c-85a6-b2f78a75dbcd	user-seller	user-buyer	5	ok	\N	\N	\N	f	\N	\N	2025-10-22 09:31:56.079	2025-10-22 09:31:56.077
ab0e2f23-e940-43e4-a0b5-05de3373ef8b	72682c91-7499-4f0c-85a6-b2f78a75dbcd	user-buyer	user-seller	5	ok	\N	\N	\N	f	\N	\N	2025-10-22 09:32:36.399	2025-10-22 09:32:36.398
f01066c7-0f7f-4e11-bd93-f3488cc51dc4	a4d89d1a-d4de-4d09-9cb7-2360ad985799	user-buyer	user-seller	5	\N	\N	\N	\N	f	\N	\N	2025-10-23 05:15:40.669	2025-10-23 05:15:40.666
\.


--
-- Data for Name: rfqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rfqs (id, listing_id, buyer_id, purpose, quantity, need_by, services_json, status, submitted_at, expired_at, created_at, updated_at) FROM stdin;
66136a97-977e-4260-8830-90b09a25b645	58e542b1-188a-4152-8799-2f63a14b9cb3	user-buyer	PURCHASE	1	2024-12-31 00:00:00	{}	SUBMITTED	2025-10-14 02:50:10.528	2025-10-21 02:50:10.528	2025-10-14 02:50:10.531	2025-10-14 02:50:10.528
786a2e7a-b1ed-4d17-9725-14cf666bb08f	58e542b1-188a-4152-8799-2f63a14b9cb3	user-buyer	PURCHASE	10	2025-10-17 00:00:00	{"inspection": false, "certification": false, "repair_estimate": false, "delivery_estimate": true}	SUBMITTED	2025-10-14 03:01:17.87	2025-10-21 03:01:17.87	2025-10-14 03:01:17.873	2025-10-14 03:01:17.871
c5ecf853-38ac-4a5c-8419-1a05c73dc5c6	58e542b1-188a-4152-8799-2f63a14b9cb3	user-buyer	PURCHASE	1	2024-12-31 00:00:00	{}	SUBMITTED	2025-10-14 03:03:14.715	2025-10-21 03:03:14.715	2025-10-14 03:03:14.717	2025-10-14 03:03:14.715
f6dd1d9e-c13a-4f3f-af36-72e46e61d0a9	58e542b1-188a-4152-8799-2f63a14b9cb3	user-buyer	PURCHASE	2	2024-12-31 00:00:00	{"inspection": true, "delivery_estimate": true}	SUBMITTED	2025-10-14 03:18:02.334	2025-10-21 03:18:02.334	2025-10-14 03:18:02.337	2025-10-14 03:18:02.334
f85c9e47-9f2d-49aa-aa4e-07042cc07710	8db66227-c31c-42d3-9e75-b77cc6809495	user-buyer	PURCHASE	20	2025-10-25 00:00:00	{"inspection": false, "certification": false, "repair_estimate": false, "delivery_estimate": true}	SUBMITTED	2025-10-14 03:38:14.365	2025-10-21 03:38:14.365	2025-10-14 03:38:14.367	2025-10-14 03:38:14.365
2637df2e-1f2f-4491-ac80-4e0592253a54	2ae6fd5a-cef8-4baf-99f5-b7eb23e69bf0	user-buyer	PURCHASE	2	2024-12-31 00:00:00	{"inspection": true}	SUBMITTED	2025-10-14 04:32:34.291	2025-10-21 04:32:34.291	2025-10-14 04:32:34.304	2025-10-14 04:32:34.291
b8976813-52e4-4065-bf32-55ce05ab3265	cbdb7804-e0b9-4d05-aff8-4588d3a366d4	user-buyer	PURCHASE	15	2025-10-23 00:00:00	{"inspection": false, "certification": false, "repair_estimate": false, "delivery_estimate": true}	QUOTED	2025-10-14 04:20:30.582	2025-10-21 04:20:30.581	2025-10-14 04:20:30.583	2025-10-14 04:20:30.582
e8b693ed-0ccc-4b1a-872d-e1249e59f1b4	136b5be7-fff8-4c95-b746-796b3128ada4	user-buyer	PURCHASE	10	2025-10-17 00:00:00	{"inspection": false, "certification": false, "repair_estimate": false, "delivery_estimate": true}	QUOTED	2025-10-15 05:14:15.264	2025-10-22 05:14:15.264	2025-10-15 05:14:15.266	2025-10-15 05:14:15.264
70ec4610-ac7e-47bd-902f-efe2b77904a8	cbdb7804-e0b9-4d05-aff8-4588d3a366d4	user-buyer	PURCHASE	15	2025-10-23 00:00:00	{"inspection": false, "certification": false, "repair_estimate": false, "delivery_estimate": true}	ACCEPTED	2025-10-14 03:56:30.115	2025-10-21 03:56:30.115	2025-10-14 03:56:30.118	2025-10-14 03:56:30.115
154aff95-b692-4ef5-82df-de703e3ced7e	00dc48ed-5625-44ad-b600-038f569da9d7	user-buyer	PURCHASE	100	2025-10-23 00:00:00	{"inspection": true, "certification": true, "repair_estimate": true, "delivery_estimate": true}	ACCEPTED	2025-10-20 08:34:34.435	2025-10-27 08:34:34.435	2025-10-20 08:34:34.437	2025-10-20 08:34:34.435
36eeea65-c5ad-47e5-9452-57d1db810e0f	136b5be7-fff8-4c95-b746-796b3128ada4	user-buyer	PURCHASE	70	2025-10-23 00:00:00	{"inspection": true, "certification": false, "repair_estimate": true, "delivery_estimate": true}	ACCEPTED	2025-10-20 09:11:31.703	2025-10-27 09:11:31.703	2025-10-20 09:11:31.705	2025-10-20 09:11:31.703
1b5f0424-70eb-4e13-bc26-0f124aff77eb	ab1c7335-ff85-4782-87c7-3ea188d88305	user-buyer	PURCHASE	100	2025-10-28 00:00:00	{"inspection": true, "certification": true, "repair_estimate": true, "delivery_estimate": true}	SUBMITTED	2025-10-23 04:02:32.131	2025-10-30 04:02:32.131	2025-10-23 04:02:32.132	2025-10-23 04:02:32.131
cb2d73f1-5348-403d-a060-b9b835d7f881	2ae6fd5a-cef8-4baf-99f5-b7eb23e69bf0	user-buyer	PURCHASE	10	2025-10-17 00:00:00	{"inspection": false, "certification": false, "repair_estimate": false, "delivery_estimate": true}	ACCEPTED	2025-10-15 02:06:38.201	2025-10-22 02:06:38.198	2025-10-15 02:06:38.22	2025-10-15 02:06:38.201
688f02af-2964-41a0-a11d-a9cd1c440da8	dce2d035-2f62-4fd3-aeaf-ada7de1e6dbe	user-buyer	PURCHASE	10	2025-10-18 00:00:00	{"inspection": true, "certification": true, "repair_estimate": true, "delivery_estimate": true}	ACCEPTED	2025-10-17 09:33:31.318	2025-10-24 09:33:31.317	2025-10-17 09:33:31.32	2025-10-17 09:33:31.318
a8f5af5d-3072-49b3-975d-3d8b9cb45399	32e3c2f0-ce33-4a02-899c-1cf21e216c0a	user-buyer	PURCHASE	20	2025-10-20 00:00:00	{"inspection": false, "certification": false, "repair_estimate": false, "delivery_estimate": true}	QUOTED	2025-10-16 01:58:18.477	2025-10-23 01:58:18.477	2025-10-16 01:58:18.482	2025-10-16 01:58:18.477
65bcd8c8-d8ef-4b9f-8518-1df7f85d5e56	6e5e38f3-7a09-4b6f-ac03-1f92b192aea8	user-buyer	PURCHASE	50	2025-10-27 00:00:00	{"inspection": true, "certification": true, "repair_estimate": true, "delivery_estimate": true}	ACCEPTED	2025-10-23 04:43:49.183	2025-10-30 04:43:49.183	2025-10-23 04:43:49.185	2025-10-23 04:43:49.183
3669265c-baad-4507-a903-b65f710a42b6	00dc48ed-5625-44ad-b600-038f569da9d7	user-buyer	PURCHASE	15	2025-10-25 00:00:00	{"inspection": true, "certification": true, "repair_estimate": true, "delivery_estimate": true}	ACCEPTED	2025-10-20 06:38:05.163	2025-10-27 06:38:05.163	2025-10-20 06:38:05.165	2025-10-20 06:38:05.163
2d424f9a-94b6-4379-aa1c-efbe98962aa6	6e5e38f3-7a09-4b6f-ac03-1f92b192aea8	user-buyer	PURCHASE	1	\N	{"inspection": false, "certification": false, "repair_estimate": false, "delivery_estimate": true}	SUBMITTED	2025-10-28 03:32:42.21	2025-11-04 03:32:42.21	2025-10-28 03:32:42.212	2025-10-28 03:32:42.21
8df487cd-f06c-4f05-a34a-7b2d4d954df6	dce2d035-2f62-4fd3-aeaf-ada7de1e6dbe	user-buyer	RENTAL	10	2025-10-23 00:00:00	{"inspection": true, "certification": true, "repair_estimate": false, "delivery_estimate": true}	QUOTED	2025-10-20 07:28:51.185	2025-10-27 07:28:51.184	2025-10-20 07:28:51.186	2025-10-20 07:28:51.185
08b49e0e-b3a1-4d84-b37d-0729961dad81	32e3c2f0-ce33-4a02-899c-1cf21e216c0a	user-buyer	PURCHASE	50	2025-10-24 00:00:00	{"inspection": true, "certification": true, "repair_estimate": true, "delivery_estimate": true}	QUOTED	2025-10-20 06:58:02.771	2025-10-27 06:58:02.769	2025-10-20 06:58:02.773	2025-10-20 06:58:02.771
943aced2-3117-4ddf-87ee-4674d2bbb47f	ab1c7335-ff85-4782-87c7-3ea188d88305	user-seller	PURCHASE	1	\N	{"inspection": false, "certification": false, "repair_estimate": false, "delivery_estimate": true}	SUBMITTED	2025-10-28 03:33:16.037	2025-11-04 03:33:16.037	2025-10-28 03:33:16.039	2025-10-28 03:33:16.037
da8ccc73-598f-4e97-a7fb-370ac8163f98	e55ae805-34c1-4ed5-93ab-8927b9b877a0	user-seller	PURCHASE	20	2025-10-30 00:00:00	{"inspection": true, "certification": true, "repair_estimate": true, "delivery_estimate": true}	SUBMITTED	2025-10-28 03:38:27.563	2025-11-04 03:38:27.563	2025-10-28 03:38:27.566	2025-10-28 03:38:27.563
9708c22a-c425-4bd4-9af8-525d6d15688e	4988d8f6-b8e4-4298-be96-b084d5c8cd10	user-buyer	RENTAL	100	2025-11-05 00:00:00	{"inspection": true, "certification": true, "repair_estimate": true, "delivery_estimate": true}	ACCEPTED	2025-10-31 04:54:47.772	2025-11-07 04:54:47.771	2025-10-31 04:54:47.774	2025-10-31 04:54:47.772
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, role_id, permission_id, scope, created_at) FROM stdin;
2cd4eb3f-d1ff-4b66-b308-bc793ee55bba	role-admin	perm-pm-001	GLOBAL	2025-10-28 15:54:45.317
3aca4f21-a381-4a24-b4e7-4543cab1b014	role-admin	perm-pm-002	GLOBAL	2025-10-28 15:54:45.317
d211e9d1-f781-4787-8ae4-0b858b5a9744	role-admin	perm-pm-003	GLOBAL	2025-10-28 15:54:45.317
d11d5be2-71a8-431f-950d-402c544485e6	role-admin	perm-pm-010	GLOBAL	2025-10-28 15:54:45.317
ce4e958a-8f36-4782-af9a-cc51a065b4ff	role-admin	perm-pm-011	GLOBAL	2025-10-28 15:54:45.317
3bee40aa-8e07-41f3-8d20-dcec55caaa52	role-admin	perm-pm-012	GLOBAL	2025-10-28 15:54:45.317
3e1ee425-e682-4b08-90cf-1eacf47a102d	role-admin	perm-pm-013	GLOBAL	2025-10-28 15:54:45.317
1ca0e331-ffed-4011-9473-32d305a15159	role-admin	perm-pm-014	GLOBAL	2025-10-28 15:54:45.317
23b62c57-b618-4874-9f62-852f5a53d3b0	role-admin	perm-pm-020	GLOBAL	2025-10-28 15:54:45.317
f6c1ce76-c1a6-40c1-bae6-3cc22cad86fd	role-admin	perm-pm-021	GLOBAL	2025-10-28 15:54:45.317
dec7f709-c43b-4b1d-bd0f-b80fbab051c4	role-admin	perm-pm-022	GLOBAL	2025-10-28 15:54:45.317
46471482-5acd-41ff-aaf5-4192cd69d9c8	role-admin	perm-pm-023	GLOBAL	2025-10-28 15:54:45.317
83a8846c-c07b-4831-a4b8-8d1706b9bf38	role-admin	perm-pm-024	GLOBAL	2025-10-28 15:54:45.317
3702a193-5ae5-4ab7-af54-0d22461dadd9	role-admin	perm-pm-030	GLOBAL	2025-10-28 15:54:45.317
7946fa3e-fb27-44e8-a480-6b7bd7972a0b	role-admin	perm-pm-031	GLOBAL	2025-10-28 15:54:45.317
164973fb-c35d-44b6-9406-14b3f80e893c	role-admin	perm-pm-040	GLOBAL	2025-10-28 15:54:45.317
dcb41310-e1ba-49c5-b12a-af02c12f4ad5	role-admin	perm-pm-041	GLOBAL	2025-10-28 15:54:45.317
eeb65aeb-8fed-436c-99e5-a95071808164	role-admin	perm-pm-042	GLOBAL	2025-10-28 15:54:45.317
7ef408c4-3a17-49e6-ab94-f7a72bb9276b	role-admin	perm-pm-043	GLOBAL	2025-10-28 15:54:45.317
af9b8c00-75cb-4015-a7fe-bb395c4c2345	role-admin	perm-pm-050	GLOBAL	2025-10-28 15:54:45.317
b2a69d97-575b-4176-98d3-236caaea84a2	role-admin	perm-pm-060	GLOBAL	2025-10-28 15:54:45.317
a224114e-8f72-4031-868f-198594bdec9c	role-admin	perm-pm-061	GLOBAL	2025-10-28 15:54:45.317
d76d56ab-8b15-4e16-aa60-55db5f134d44	role-admin	perm-pm-070	GLOBAL	2025-10-28 15:54:45.317
cc60e26b-2361-4b43-afdf-fcc1a8eb8948	role-admin	perm-pm-071	GLOBAL	2025-10-28 15:54:45.317
0f2c745c-1f04-48fe-bc2a-3e373791b353	role-admin	perm-pm-072	GLOBAL	2025-10-28 15:54:45.317
f104134a-420e-43de-a452-c033fc916839	role-admin	perm-pm-073	GLOBAL	2025-10-28 15:54:45.317
591d237c-2bf9-46d5-9fcd-727a985aaf18	role-admin	perm-pm-074	GLOBAL	2025-10-28 15:54:45.317
469b9225-872d-4033-9115-3360151408ab	role-admin	perm-pm-080	GLOBAL	2025-10-28 15:54:45.317
0d749e93-a91b-49bc-b4ad-e321965a0360	role-admin	perm-pm-081	GLOBAL	2025-10-28 15:54:45.317
28cdcb78-c61b-458e-b975-ae741d99648b	role-admin	perm-pm-082	GLOBAL	2025-10-28 15:54:45.317
8488254f-8d9f-490c-89c4-0bf0c29f4ee0	role-admin	perm-pm-083	GLOBAL	2025-10-28 15:54:45.317
5de254ae-7f4c-4a42-a117-676fc152b0d9	role-admin	perm-pm-084	GLOBAL	2025-10-28 15:54:45.317
3aa0e53a-06c4-4347-805c-cce7c6bd3834	role-admin	perm-pm-085	GLOBAL	2025-10-28 15:54:45.317
742a5ad1-0273-4fda-9bbd-b1b9c7d6448c	role-admin	perm-pm-086	GLOBAL	2025-10-28 15:54:45.317
31a7fa32-284f-469b-8d68-90f58023d4d7	role-admin	perm-pm-090	GLOBAL	2025-10-28 15:54:45.317
e7548ad2-e3a6-4fd2-b525-bf00c13b375e	role-admin	perm-pm-091	GLOBAL	2025-10-28 15:54:45.317
fa77979a-0024-42cf-ae19-359d295fc7d1	role-admin	perm-pm-100	GLOBAL	2025-10-28 15:54:45.317
6045b324-6afb-4120-b05b-5ab5aa758005	role-admin	perm-pm-110	GLOBAL	2025-10-28 15:54:45.317
24631579-a10a-4945-b48d-b541a37eda49	role-admin	perm-pm-111	GLOBAL	2025-10-28 15:54:45.317
c1193b31-4ff0-464d-8f2b-2cdcd2098449	role-admin	perm-pm-112	GLOBAL	2025-10-28 15:54:45.317
791ef271-ac67-4e6c-98e7-37a6e6e8a0dd	role-admin	perm-pm-113	GLOBAL	2025-10-28 15:54:45.317
26098951-c779-4e87-abf4-e258485f62ca	role-admin	perm-pm-114	GLOBAL	2025-10-28 15:54:45.317
6140df83-3eb5-47ed-aaf6-d020714ed0b5	role-admin	perm-pm-115	GLOBAL	2025-10-28 15:54:45.317
e56b7ca6-675f-456b-a362-fe2b6d528655	role-admin	perm-pm-116	GLOBAL	2025-10-28 15:54:45.317
09831502-f138-4c0c-90f2-ed2323d7299d	role-admin	perm-pm-117	GLOBAL	2025-10-28 15:54:45.317
20d6a98d-e8a5-4671-8766-4b2300d76704	role-admin	perm-pm-118	GLOBAL	2025-10-28 15:54:45.317
e30b7253-f5b6-4026-b65c-418460a2f745	role-admin	perm-pm-119	GLOBAL	2025-10-28 15:54:45.317
c0db9baf-e7b0-4838-b56d-59655938dd57	role-admin	perm-pm-120	GLOBAL	2025-10-28 15:54:45.317
123cea63-744c-40cc-97d3-3cac86825cdb	role-admin	perm-pm-121	GLOBAL	2025-10-28 15:54:45.317
c1a3785f-3708-434a-9b18-a2fc239ced60	role-admin	perm-pm-122	GLOBAL	2025-10-28 15:54:45.317
b00de791-7ecd-4531-8638-3a0e6b611dcd	role-admin	perm-pm-123	GLOBAL	2025-10-28 15:54:45.317
0489904f-1e0f-49c6-ab8e-b2f2a3f0a3ec	role-admin	perm-pm-124	GLOBAL	2025-10-28 15:54:45.317
91ba8489-99f1-4bde-acf5-f458d0399068	role-admin	perm-pm-125	GLOBAL	2025-10-28 15:54:45.317
2ff51a21-dac0-45f8-9287-7979580f9640	role-admin	01ebfa09-f075-4592-b0da-03da3436067b	GLOBAL	2025-10-28 15:54:45.317
72d7f876-4b1f-43f2-809a-bd8bc717016c	role-config_manager	perm-pm-110	GLOBAL	2025-10-28 15:54:45.482
0d736c91-9795-445a-812c-d62fdd84db77	role-config_manager	perm-pm-111	GLOBAL	2025-10-28 15:54:45.482
668d40a1-4ca9-4379-875e-e550bd8768d7	role-config_manager	perm-pm-112	GLOBAL	2025-10-28 15:54:45.482
e58aeabd-e25c-408b-be78-4ac4f7102519	role-config_manager	perm-pm-113	GLOBAL	2025-10-28 15:54:45.482
18bd01bf-4c3a-4eba-b60f-ddf60637a729	role-config_manager	perm-pm-114	GLOBAL	2025-10-28 15:54:45.482
e4247eb6-1637-4885-bbc7-bf044506aedc	role-config_manager	perm-pm-115	GLOBAL	2025-10-28 15:54:45.482
79e22330-a403-43db-a75b-27da7f77244c	role-config_manager	perm-pm-116	GLOBAL	2025-10-28 15:54:45.482
04891176-cc46-4d54-98bd-df7f6b3c170e	role-config_manager	perm-pm-117	GLOBAL	2025-10-28 15:54:45.482
a75411f8-9f4d-46c5-b67a-f2100f939a43	role-config_manager	perm-pm-118	GLOBAL	2025-10-28 15:54:45.482
1b5136ef-f946-4028-b6e1-7b18290d2124	role-config_manager	perm-pm-119	GLOBAL	2025-10-28 15:54:45.482
cedcf935-3d64-4440-a3bf-6e6c754ccb96	role-config_manager	perm-pm-120	GLOBAL	2025-10-28 15:54:45.482
10425fad-e0b3-4517-bff7-0399385046d5	role-config_manager	perm-pm-121	GLOBAL	2025-10-28 15:54:45.482
35eba011-e4d7-41b1-9712-a21c68f96e8e	role-config_manager	perm-pm-122	GLOBAL	2025-10-28 15:54:45.482
a2135d2f-e118-441e-ba2b-221c68a94ea5	role-config_manager	perm-pm-123	GLOBAL	2025-10-28 15:54:45.482
4f37e4dd-7551-4fd6-abb6-c3cb73a35e94	role-config_manager	perm-pm-124	GLOBAL	2025-10-28 15:54:45.482
4edbd6ed-a9d3-42d1-9a2c-55d6e1e8bf76	role-config_manager	perm-pm-125	GLOBAL	2025-10-28 15:54:45.482
003f05ec-73cc-4f0d-acea-b93b9ae5443e	role-finance	perm-pm-001	GLOBAL	2025-10-28 15:54:45.515
dbf32c17-7499-4a8c-8c4e-71916c403e92	role-finance	perm-pm-002	GLOBAL	2025-10-28 15:54:45.515
206b4b9c-ae4d-4da7-8723-d0060a88dd65	role-finance	perm-pm-040	GLOBAL	2025-10-28 15:54:45.515
57a5e646-6c42-449e-8482-b3b3c24a1fd7	role-finance	perm-pm-043	GLOBAL	2025-10-28 15:54:45.515
619853f2-ee12-481e-8199-c064e5e27d70	role-finance	perm-pm-090	GLOBAL	2025-10-28 15:54:45.515
b0057928-7873-4b0c-aec9-b088828fd9a3	role-finance	perm-pm-091	GLOBAL	2025-10-28 15:54:45.515
b5685878-04b3-41c3-a586-8502aadf58a5	role-price_manager	perm-pm-001	GLOBAL	2025-10-28 15:54:45.537
431bb81e-4836-449b-9968-d628c33d2b9e	role-price_manager	perm-pm-002	GLOBAL	2025-10-28 15:54:45.537
2246c217-927a-4c5f-ba2a-2b185e167262	role-price_manager	perm-pm-073	GLOBAL	2025-10-28 15:54:45.537
8eebdca5-4721-4a7c-af22-d0b68ae7e102	role-price_manager	perm-pm-074	GLOBAL	2025-10-28 15:54:45.537
d3b4c53f-c103-4f7f-b719-dbcf32d91cc7	role-customer_support	perm-pm-001	GLOBAL	2025-10-28 15:54:45.556
e2333846-18c5-43e8-ab51-362e706180ad	role-customer_support	perm-pm-002	GLOBAL	2025-10-28 15:54:45.556
4ed2ef5c-553b-4b12-8f63-e6ded942665c	role-customer_support	perm-pm-060	GLOBAL	2025-10-28 15:54:45.556
4f96dd6d-3964-47aa-aaac-71cdfc0c0f0b	role-customer_support	perm-pm-061	GLOBAL	2025-10-28 15:54:45.556
50102ee9-ed6b-4a2e-a70c-35b0cd7d3b40	role-customer_support	perm-pm-100	GLOBAL	2025-10-28 15:54:45.556
ab3c8e18-39ed-4490-80e4-82c104849e98	role-depot_manager	perm-pm-001	GLOBAL	2025-10-28 15:54:45.576
ab0e4cf4-3118-4fba-ac37-17392e8b3615	role-depot_manager	perm-pm-002	GLOBAL	2025-10-28 15:54:45.576
ec2182ab-962a-415a-bde4-ff8c084293c6	role-depot_manager	perm-pm-080	GLOBAL	2025-10-28 15:54:45.576
0b444d9b-a6c9-4dc9-b416-f7362bcf49d1	role-depot_manager	perm-pm-081	GLOBAL	2025-10-28 15:54:45.576
08c2b8ee-cef0-420f-bd9b-573f348ce10a	role-depot_manager	perm-pm-082	GLOBAL	2025-10-28 15:54:45.576
9689e9db-ffb9-44b1-b066-ad38243845bc	role-depot_manager	perm-pm-083	GLOBAL	2025-10-28 15:54:45.576
33db4eae-cc88-4f65-bbe4-d7eff3c26c3f	role-depot_manager	perm-pm-084	GLOBAL	2025-10-28 15:54:45.576
4438f26d-7cf2-4298-a0be-fcb3069597be	role-depot_manager	perm-pm-085	GLOBAL	2025-10-28 15:54:45.576
21fcc7af-4b9b-41b5-8595-93ef9ab6ab49	role-depot_manager	perm-pm-086	GLOBAL	2025-10-28 15:54:45.576
fa06d979-9893-4973-8acf-694540907568	role-inspector	perm-pm-001	GLOBAL	2025-10-28 15:54:45.602
d9c7ce15-03ca-4c2f-8130-33d08d9f8559	role-inspector	perm-pm-002	GLOBAL	2025-10-28 15:54:45.602
24f7c98f-f1bf-45c4-9fb9-3d455df62420	role-inspector	perm-pm-030	GLOBAL	2025-10-28 15:54:45.602
a681c020-9c49-42af-bdec-7eaee7558072	role-inspector	perm-pm-031	GLOBAL	2025-10-28 15:54:45.602
7ba680b7-e637-4ba2-a4b8-e97b45eb076b	role-depot_staff	perm-pm-001	GLOBAL	2025-10-28 15:54:45.62
1334a5ab-bd18-4999-89bc-956cc9394fe0	role-depot_staff	perm-pm-002	GLOBAL	2025-10-28 15:54:45.62
26345a87-2272-4661-804d-d8f6df689ebf	role-depot_staff	perm-pm-083	GLOBAL	2025-10-28 15:54:45.62
f2b68bf6-fee5-4d87-aca1-b570d9d4ccd3	role-depot_staff	perm-pm-084	GLOBAL	2025-10-28 15:54:45.62
292186fd-0aba-45b8-9d19-5f3b70cd5659	role-buyer	perm-pm-001	GLOBAL	2025-10-28 15:54:45.639
9b8bfe1d-03bc-41c9-be84-6fdd35ae200d	role-buyer	perm-pm-002	GLOBAL	2025-10-28 15:54:45.639
3de2113f-721d-4d20-ab30-86b6324fed3a	role-buyer	perm-pm-003	GLOBAL	2025-10-28 15:54:45.639
c270c3d5-4a17-423e-822c-74eeee1fac79	role-buyer	perm-pm-010	GLOBAL	2025-10-28 15:54:45.639
83091c2f-801b-4380-9677-9fb4ab82ccba	role-buyer	perm-pm-011	GLOBAL	2025-10-28 15:54:45.639
34f6c5c4-4c5e-441e-9037-1099bcd9fb96	role-buyer	perm-pm-012	GLOBAL	2025-10-28 15:54:45.639
08e1d0ef-a804-4a13-8846-1374ca6b6822	role-buyer	perm-pm-013	GLOBAL	2025-10-28 15:54:45.639
8d3ffe5f-cbdb-42bd-9cb0-70caf5a14774	role-buyer	perm-pm-014	GLOBAL	2025-10-28 15:54:45.639
8b3e8599-ac14-423f-8361-5da73599b209	role-buyer	perm-pm-020	GLOBAL	2025-10-28 15:54:45.639
6a9ddb79-1931-4142-bf48-4fbf2485e880	role-buyer	perm-pm-021	GLOBAL	2025-10-28 15:54:45.639
4f26ed7c-5cf6-4a25-9ed8-53a11ee2d0ab	role-buyer	perm-pm-022	GLOBAL	2025-10-28 15:54:45.639
8eb3f7fe-5ca2-45f0-87c5-0827d352473c	role-buyer	perm-pm-023	GLOBAL	2025-10-28 15:54:45.639
eb664199-a1cc-4554-96a3-c1daf37d23b0	role-buyer	perm-pm-030	GLOBAL	2025-10-28 15:54:45.639
4e313406-02ed-4194-911d-3dcae7df9bc5	role-buyer	perm-pm-031	GLOBAL	2025-10-28 15:54:45.639
9912ac08-9b90-45f1-91ca-c91685548932	role-buyer	perm-pm-040	GLOBAL	2025-10-28 15:54:45.639
fb95029b-09c5-4554-9596-0d7191c51906	role-buyer	perm-pm-041	GLOBAL	2025-10-28 15:54:45.639
acff3662-beb3-41dc-969b-ad3f09c0f353	role-buyer	perm-pm-042	GLOBAL	2025-10-28 15:54:45.639
780f266f-b1f7-491a-9ee6-19ff8a9e003b	role-buyer	perm-pm-043	GLOBAL	2025-10-28 15:54:45.639
21c2d713-252b-490a-809d-1825a322e499	role-buyer	perm-pm-050	GLOBAL	2025-10-28 15:54:45.639
cfb6e4ec-0f58-40b5-a3f7-30caab4d4e61	role-buyer	perm-pm-060	GLOBAL	2025-10-28 15:54:45.639
3d21ac4b-fa9e-4681-a410-1bd9d93ff5ba	role-buyer	perm-pm-090	GLOBAL	2025-10-28 15:54:45.639
17a38dee-29f8-4d73-aa32-edff81a19d74	role-seller	perm-pm-001	GLOBAL	2025-10-28 15:54:45.673
ba15d670-3dc5-48ce-ad06-6aab7cafffad	role-seller	perm-pm-002	GLOBAL	2025-10-28 15:54:45.673
03527a81-be16-4ea6-84ca-fd23497bc0a2	role-seller	perm-pm-003	GLOBAL	2025-10-28 15:54:45.673
48df7329-0f35-4cdc-9c22-17615c6c96b4	role-seller	perm-pm-010	GLOBAL	2025-10-28 15:54:45.673
d7a67ca8-a256-4f64-97be-94225002fade	role-seller	perm-pm-011	GLOBAL	2025-10-28 15:54:45.673
cf86d957-8ba7-4efd-8d14-34de3e183251	role-seller	perm-pm-012	GLOBAL	2025-10-28 15:54:45.673
f723a0a4-b17d-488a-a568-54ed8b2a12aa	role-seller	perm-pm-013	GLOBAL	2025-10-28 15:54:45.673
8de75285-b315-4f3b-85ad-2e8584bc9353	role-seller	perm-pm-014	GLOBAL	2025-10-28 15:54:45.673
acb31315-6dc3-480b-b2c3-f253023d3c9e	role-seller	perm-pm-020	GLOBAL	2025-10-28 15:54:45.673
cc7185b3-13c4-4d46-83e4-d52fa4a5fea6	role-seller	perm-pm-021	GLOBAL	2025-10-28 15:54:45.673
ad19ff06-4a1d-4bed-9bf5-8f045f445d83	role-seller	perm-pm-022	GLOBAL	2025-10-28 15:54:45.673
19b72096-d67b-4a09-b9f1-91e711264d04	role-seller	perm-pm-023	GLOBAL	2025-10-28 15:54:45.673
c7bf6e07-6d4c-4587-bf58-c4240eb8840b	role-seller	perm-pm-030	GLOBAL	2025-10-28 15:54:45.673
672d78e1-8a11-4c5e-bbdb-0872aca02e93	role-seller	perm-pm-031	GLOBAL	2025-10-28 15:54:45.673
7444d179-bdbc-4096-a239-f9619dd30885	role-seller	perm-pm-040	GLOBAL	2025-10-28 15:54:45.673
f8346739-ed7c-42c7-ba18-47732695a86b	role-seller	perm-pm-041	GLOBAL	2025-10-28 15:54:45.673
8762d2a8-13d7-4e53-85fb-6e20187fa25a	role-seller	perm-pm-042	GLOBAL	2025-10-28 15:54:45.673
7c4c6df5-50b0-4022-865f-6893339cd6cd	role-seller	perm-pm-043	GLOBAL	2025-10-28 15:54:45.673
b9530e3e-4362-4287-abf9-d147b7784c09	role-seller	perm-pm-050	GLOBAL	2025-10-28 15:54:45.673
173dccf4-e006-4f69-8e6d-b7171475ee73	role-seller	perm-pm-060	GLOBAL	2025-10-28 15:54:45.673
e85291b0-9adc-41fb-9610-fa1b8b4c4609	role-seller	perm-pm-090	GLOBAL	2025-10-28 15:54:45.673
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, code, name, description, level, is_system_role, created_at, updated_at, role_version) FROM stdin;
role-finance	finance	Kế toán	Quản lý tài chính	70	t	2025-10-09 07:25:05.135	2025-10-28 15:54:45.515	13
role-depot_manager	depot_manager	Quản lý kho bãi	Quản lý depot	30	t	2025-10-09 07:25:05.137	2025-10-28 15:54:45.576	13
role-price_manager	price_manager	Quản lý giá	Quản lý giá cả	60	t	2025-10-09 07:25:05.136	2025-10-28 15:54:45.537	13
role-inspector	inspector	Giám định viên	Giám định container	25	t	2025-10-09 07:25:05.138	2025-10-28 15:54:45.602	13
role-customer_support	customer_support	Hỗ trợ khách hàng	Hỗ trợ khách hàng	50	t	2025-10-09 07:25:05.136	2025-10-28 15:54:45.556	13
role-config_manager	config_manager	Quản lý cấu hình	Quản lý cấu hình hệ thống	80	t	2025-10-09 07:25:05.133	2025-10-28 15:54:45.482	13
role-depot_staff	depot_staff	Nhân viên kho	Nhân viên depot	20	t	2025-10-09 07:25:05.139	2025-10-28 15:54:45.62	13
role-admin	admin	Quản trị viên	Toàn quyền hệ thống	100	t	2025-10-09 07:25:05.13	2025-10-28 15:54:45.317	15
role-seller	seller	Người bán	Bán container	10	t	2025-10-09 07:25:05.14	2025-10-28 15:54:45.673	17
role-buyer	buyer	Người mua	Mua container	10	t	2025-10-09 07:25:05.142	2025-10-28 15:54:45.639	16
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, description, category, is_public, created_at, updated_at) FROM stdin;
40571a65-969c-48a1-817e-2cc9c309518b	SITE_NAME	"\\"i-ContExchange\\""	Tên website	general	t	2025-10-09 07:51:30.62	2025-10-09 07:51:30.618
91b73087-610d-490a-bb53-0cb035ccb727	SITE_DESCRIPTION	"\\"Nền tảng mua bán container hàng đầu Việt Nam\\""	Mô tả website	general	t	2025-10-09 07:51:30.62	2025-10-09 07:51:30.618
69570f73-a7f0-468d-b750-18ad8e2d997e	DEFAULT_CURRENCY	"\\"VND\\""	Tiền tệ mặc định	financial	t	2025-10-09 07:51:30.62	2025-10-09 07:51:30.618
13f39065-b9bb-46cd-8934-b31ee15de06c	COMMISSION_RATE	"3.5"	Tỷ lệ hoa hồng mặc định (%)	financial	f	2025-10-09 07:51:30.62	2025-10-09 07:51:30.618
ae462d5e-bc87-463d-b973-e0fa7bdaabd9	LISTING_APPROVAL_REQUIRED	"true"	Yêu cầu duyệt tin đăng	moderation	f	2025-10-09 07:51:30.62	2025-10-09 07:51:30.618
82f8fb81-0eb3-4367-a6b7-da99e7efccdd	MAX_FREE_LISTINGS	"5"	Số tin đăng miễn phí tối đa	limits	t	2025-10-09 07:51:30.62	2025-10-09 07:51:30.618
9bc82508-0b82-4ba0-8a1b-2fa385aca65b	MAINTENANCE_MODE	"false"	Chế độ bảo trì	system	t	2025-10-09 07:51:30.62	2025-10-09 07:51:30.618
66f4b58f-aa3b-4554-9d8b-5078849b21e6	SUPPORT_EMAIL	"\\"support@i-contexchange.vn\\""	Email hỗ trợ	contact	t	2025-10-09 07:51:30.62	2025-10-09 07:51:30.618
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, user_id, org_id, plan_id, status, started_at, renewed_at, expires_at, cancelled_at, cancelled_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tax_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_rates (id, region, tax_code, rate, effective_from, effective_to, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, user_id, role_id, assigned_by, assigned_at, expires_at, created_at) FROM stdin;
user-role-admin	user-admin	role-admin	\N	2025-10-09 07:25:05.533	\N	2025-10-09 07:25:05.533
user-role-config_manager	user-config_manager	role-config_manager	\N	2025-10-09 07:25:05.962	\N	2025-10-09 07:25:05.962
user-role-finance	user-finance	role-finance	\N	2025-10-09 07:25:06.311	\N	2025-10-09 07:25:06.311
user-role-price_manager	user-price_manager	role-price_manager	\N	2025-10-09 07:25:06.655	\N	2025-10-09 07:25:06.655
user-role-customer_support	user-customer_support	role-customer_support	\N	2025-10-09 07:25:07	\N	2025-10-09 07:25:07
user-role-depot_manager	user-depot_manager	role-depot_manager	\N	2025-10-09 07:25:07.344	\N	2025-10-09 07:25:07.344
user-role-inspector	user-inspector	role-inspector	\N	2025-10-09 07:25:07.712	\N	2025-10-09 07:25:07.712
user-role-depot_staff	user-depot_staff	role-depot_staff	\N	2025-10-09 07:25:08.056	\N	2025-10-09 07:25:08.056
user-role-seller	user-seller	role-seller	\N	2025-10-09 07:25:08.392	\N	2025-10-09 07:25:08.392
user-role-buyer	user-buyer	role-buyer	\N	2025-10-09 07:25:08.739	\N	2025-10-09 07:25:08.739
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, phone, password_hash, status, kyc_status, display_name, first_name, last_name, avatar_url, default_locale, timezone, last_login_at, email_verified_at, phone_verified_at, created_at, updated_at, deleted_at, permissions_updated_at) FROM stdin;
user-admin	admin@i-contexchange.vn	+84901234560	$2a$12$q2sbhVgdsKG4s33brH5PSOYDNzbN0fX92rCMDAp8KMjurrY8SPbQ6	ACTIVE	VERIFIED	Quản trị viên hệ thống	\N	\N	\N	vi	Asia/Ho_Chi_Minh	2025-10-31 07:57:14.751	\N	\N	2025-10-09 07:25:05.525	2025-10-28 09:10:12.175	\N	\N
640a4460-4cea-4edb-b5dc-32b8cad6360c	test@example.com	\N	$2a$12$lV.thKQur9pPP/AVH3RaGudOWgXXQF7ejpon3QMb1sCIY.hRf6Q.W	ACTIVE	UNVERIFIED	Test User	\N	\N	\N	vi	Asia/Ho_Chi_Minh	2025-10-16 09:40:24.945	\N	\N	2025-10-11 02:35:42.934	2025-10-11 02:35:42.931	\N	\N
user-config_manager	config@example.com	+84901234561	$2a$12$.dDdFW4/o603thf31glH5u.xq4tKoN1Q4gG1ndx1AO1fu9oAQz0t6	ACTIVE	VERIFIED	Quản lý cấu hình	\N	\N	\N	vi	Asia/Ho_Chi_Minh	\N	\N	\N	2025-10-09 07:25:05.958	2025-10-28 15:54:45.482	\N	2025-10-28 15:54:45.482
user-finance	finance@example.com	+84901234562	$2a$12$AOb6qeWMz80Vrox1v3vRBepufsrnheHn/HCHGSWHxdxJfO/P9AHqG	ACTIVE	VERIFIED	Kế toán	\N	\N	\N	vi	Asia/Ho_Chi_Minh	\N	\N	\N	2025-10-09 07:25:06.307	2025-10-28 15:54:45.515	\N	2025-10-28 15:54:45.515
user-price_manager	price@example.com	+84901234563	$2a$12$F8LSFqMOZeMaAQQOLsfDZum6F0iRZ9ag30Zqrpwwr8s/0RYlSMDZ6	ACTIVE	VERIFIED	Quản lý giá	\N	\N	\N	vi	Asia/Ho_Chi_Minh	\N	\N	\N	2025-10-09 07:25:06.651	2025-10-28 15:54:45.537	\N	2025-10-28 15:54:45.537
user-customer_support	support@example.com	+84901234564	$2a$12$Y9IRe1bHAYICTaEnlQWPz.ekBZNOz4AG8/KcXZCdtuno7xwbvMR62	ACTIVE	VERIFIED	Hỗ trợ khách hàng	\N	\N	\N	vi	Asia/Ho_Chi_Minh	\N	\N	\N	2025-10-09 07:25:06.997	2025-10-28 15:54:45.556	\N	2025-10-28 15:54:45.556
user-depot_manager	manager@example.com	+84901234565	$2a$12$yf.chF0BW0BSaCofYXO0Zu3QKBlgIFKHkoIr1SqDMuD4/tFIqO7oi	ACTIVE	VERIFIED	Quản lý kho bãi	\N	\N	\N	vi	Asia/Ho_Chi_Minh	2025-10-21 06:57:09.239	\N	\N	2025-10-09 07:25:07.34	2025-10-28 15:54:45.576	\N	2025-10-28 15:54:45.576
user-inspector	inspector@example.com	+84901234566	$2a$12$0GRyrmOEoXkfSuS340dvDeCoHk6qi0bLKec2u3rsILrlzIMsb74wC	ACTIVE	VERIFIED	Giám định viên	\N	\N	\N	vi	Asia/Ho_Chi_Minh	\N	\N	\N	2025-10-09 07:25:07.709	2025-10-28 15:54:45.602	\N	2025-10-28 15:54:45.602
user-depot_staff	depot@example.com	+84901234567	$2a$12$ETN/JA9aBtFkHiPp0tVwL.kDsHM/g2bii0.m6cc04/aufMAtHGmei	ACTIVE	VERIFIED	Nhân viên kho	\N	\N	\N	vi	Asia/Ho_Chi_Minh	\N	\N	\N	2025-10-09 07:25:08.053	2025-10-28 15:54:45.62	\N	2025-10-28 15:54:45.62
user-buyer	buyer@example.com	+84901234569	$2a$12$WRQjhU27mFd/OYBmFjAN3.475YhEnaFVp.DyvpFQVUSdlqtBnf4hO	ACTIVE	VERIFIED	Người mua container	\N	\N	\N	vi	Asia/Ho_Chi_Minh	2025-10-31 09:30:03.93	\N	\N	2025-10-09 07:25:08.736	2025-10-28 15:54:45.639	\N	\N
user-seller	seller@example.com	+84901234568	$2a$12$8eqp.V95RvFTm6OWxMQv7et8paH1n6wBjw9LJ3NOOsiO2LEtQ42L6	ACTIVE	VERIFIED	Người bán container	\N	\N	\N	vi	Asia/Ho_Chi_Minh	2025-10-31 09:30:53.09	\N	\N	2025-10-09 07:25:08.389	2025-10-28 15:54:45.673	\N	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: business_hours business_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_hours
    ADD CONSTRAINT business_hours_pkey PRIMARY KEY (id);


--
-- Name: categories categories_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_code_key UNIQUE (code);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: commission_rules commission_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commission_rules
    ADD CONSTRAINT commission_rules_pkey PRIMARY KEY (id);


--
-- Name: config_entries config_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config_entries
    ADD CONSTRAINT config_entries_pkey PRIMARY KEY (id);


--
-- Name: config_namespaces config_namespaces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config_namespaces
    ADD CONSTRAINT config_namespaces_pkey PRIMARY KEY (id);


--
-- Name: containers containers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.containers
    ADD CONSTRAINT containers_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- Name: delivery_events delivery_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_events
    ADD CONSTRAINT delivery_events_pkey PRIMARY KEY (id);


--
-- Name: depot_calendars depot_calendars_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depot_calendars
    ADD CONSTRAINT depot_calendars_pkey PRIMARY KEY (id);


--
-- Name: depot_stock_movements depot_stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depot_stock_movements
    ADD CONSTRAINT depot_stock_movements_pkey PRIMARY KEY (id);


--
-- Name: depot_users depot_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depot_users
    ADD CONSTRAINT depot_users_pkey PRIMARY KEY (id);


--
-- Name: depots depots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depots
    ADD CONSTRAINT depots_pkey PRIMARY KEY (id);


--
-- Name: dispute_audit_logs dispute_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispute_audit_logs
    ADD CONSTRAINT dispute_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: dispute_evidence dispute_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispute_evidence
    ADD CONSTRAINT dispute_evidence_pkey PRIMARY KEY (id);


--
-- Name: dispute_messages dispute_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispute_messages
    ADD CONSTRAINT dispute_messages_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: feature_flags feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_pkey PRIMARY KEY (id);


--
-- Name: fee_schedules fee_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_schedules
    ADD CONSTRAINT fee_schedules_pkey PRIMARY KEY (id);


--
-- Name: form_schemas form_schemas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_schemas
    ADD CONSTRAINT form_schemas_pkey PRIMARY KEY (id);


--
-- Name: i18n_translations i18n_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.i18n_translations
    ADD CONSTRAINT i18n_translations_pkey PRIMARY KEY (id);


--
-- Name: inspection_items inspection_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_items
    ADD CONSTRAINT inspection_items_pkey PRIMARY KEY (id);


--
-- Name: inspections inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (id);


--
-- Name: integration_configs integration_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_configs
    ADD CONSTRAINT integration_configs_pkey PRIMARY KEY (id);


--
-- Name: listing_facets listing_facets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_facets
    ADD CONSTRAINT listing_facets_pkey PRIMARY KEY (id);


--
-- Name: listing_media listing_media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_media
    ADD CONSTRAINT listing_media_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: marketplace_policies marketplace_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_policies
    ADD CONSTRAINT marketplace_policies_pkey PRIMARY KEY (id);


--
-- Name: md_adjust_reasons md_adjust_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_adjust_reasons
    ADD CONSTRAINT md_adjust_reasons_pkey PRIMARY KEY (id);


--
-- Name: md_business_hours_policies md_business_hours_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_business_hours_policies
    ADD CONSTRAINT md_business_hours_policies_pkey PRIMARY KEY (id);


--
-- Name: md_cancel_reasons md_cancel_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_cancel_reasons
    ADD CONSTRAINT md_cancel_reasons_pkey PRIMARY KEY (id);


--
-- Name: md_cities md_cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_cities
    ADD CONSTRAINT md_cities_pkey PRIMARY KEY (id);


--
-- Name: md_commission_codes md_commission_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_commission_codes
    ADD CONSTRAINT md_commission_codes_pkey PRIMARY KEY (id);


--
-- Name: md_container_sizes md_container_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_container_sizes
    ADD CONSTRAINT md_container_sizes_pkey PRIMARY KEY (id);


--
-- Name: md_container_types md_container_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_container_types
    ADD CONSTRAINT md_container_types_pkey PRIMARY KEY (id);


--
-- Name: md_countries md_countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_countries
    ADD CONSTRAINT md_countries_pkey PRIMARY KEY (id);


--
-- Name: md_currencies md_currencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_currencies
    ADD CONSTRAINT md_currencies_pkey PRIMARY KEY (id);


--
-- Name: md_deal_types md_deal_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_deal_types
    ADD CONSTRAINT md_deal_types_pkey PRIMARY KEY (id);


--
-- Name: md_delivery_event_types md_delivery_event_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_delivery_event_types
    ADD CONSTRAINT md_delivery_event_types_pkey PRIMARY KEY (id);


--
-- Name: md_delivery_statuses md_delivery_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_delivery_statuses
    ADD CONSTRAINT md_delivery_statuses_pkey PRIMARY KEY (id);


--
-- Name: md_dispute_reasons md_dispute_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_dispute_reasons
    ADD CONSTRAINT md_dispute_reasons_pkey PRIMARY KEY (id);


--
-- Name: md_dispute_statuses md_dispute_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_dispute_statuses
    ADD CONSTRAINT md_dispute_statuses_pkey PRIMARY KEY (id);


--
-- Name: md_document_types md_document_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_document_types
    ADD CONSTRAINT md_document_types_pkey PRIMARY KEY (id);


--
-- Name: md_feature_flag_codes md_feature_flag_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_feature_flag_codes
    ADD CONSTRAINT md_feature_flag_codes_pkey PRIMARY KEY (id);


--
-- Name: md_fee_codes md_fee_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_fee_codes
    ADD CONSTRAINT md_fee_codes_pkey PRIMARY KEY (id);


--
-- Name: md_form_schema_codes md_form_schema_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_form_schema_codes
    ADD CONSTRAINT md_form_schema_codes_pkey PRIMARY KEY (id);


--
-- Name: md_i18n_namespaces md_i18n_namespaces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_i18n_namespaces
    ADD CONSTRAINT md_i18n_namespaces_pkey PRIMARY KEY (id);


--
-- Name: md_incoterms md_incoterms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_incoterms
    ADD CONSTRAINT md_incoterms_pkey PRIMARY KEY (id);


--
-- Name: md_inspection_item_codes md_inspection_item_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_inspection_item_codes
    ADD CONSTRAINT md_inspection_item_codes_pkey PRIMARY KEY (id);


--
-- Name: md_insurance_coverages md_insurance_coverages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_insurance_coverages
    ADD CONSTRAINT md_insurance_coverages_pkey PRIMARY KEY (id);


--
-- Name: md_integration_vendor_codes md_integration_vendor_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_integration_vendor_codes
    ADD CONSTRAINT md_integration_vendor_codes_pkey PRIMARY KEY (id);


--
-- Name: md_iso_container_codes md_iso_container_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_iso_container_codes
    ADD CONSTRAINT md_iso_container_codes_pkey PRIMARY KEY (id);


--
-- Name: md_listing_statuses md_listing_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_listing_statuses
    ADD CONSTRAINT md_listing_statuses_pkey PRIMARY KEY (id);


--
-- Name: md_movement_types md_movement_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_movement_types
    ADD CONSTRAINT md_movement_types_pkey PRIMARY KEY (id);


--
-- Name: md_notification_channels md_notification_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_notification_channels
    ADD CONSTRAINT md_notification_channels_pkey PRIMARY KEY (id);


--
-- Name: md_notification_event_types md_notification_event_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_notification_event_types
    ADD CONSTRAINT md_notification_event_types_pkey PRIMARY KEY (id);


--
-- Name: md_order_statuses md_order_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_order_statuses
    ADD CONSTRAINT md_order_statuses_pkey PRIMARY KEY (id);


--
-- Name: md_partner_types md_partner_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_partner_types
    ADD CONSTRAINT md_partner_types_pkey PRIMARY KEY (id);


--
-- Name: md_payment_failure_reasons md_payment_failure_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_payment_failure_reasons
    ADD CONSTRAINT md_payment_failure_reasons_pkey PRIMARY KEY (id);


--
-- Name: md_payment_method_types md_payment_method_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_payment_method_types
    ADD CONSTRAINT md_payment_method_types_pkey PRIMARY KEY (id);


--
-- Name: md_payment_statuses md_payment_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_payment_statuses
    ADD CONSTRAINT md_payment_statuses_pkey PRIMARY KEY (id);


--
-- Name: md_pricing_regions md_pricing_regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_pricing_regions
    ADD CONSTRAINT md_pricing_regions_pkey PRIMARY KEY (id);


--
-- Name: md_provinces md_provinces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_provinces
    ADD CONSTRAINT md_provinces_pkey PRIMARY KEY (id);


--
-- Name: md_quality_standards md_quality_standards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_quality_standards
    ADD CONSTRAINT md_quality_standards_pkey PRIMARY KEY (id);


--
-- Name: md_rating_scales md_rating_scales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_rating_scales
    ADD CONSTRAINT md_rating_scales_pkey PRIMARY KEY (id);


--
-- Name: md_redaction_channels md_redaction_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_redaction_channels
    ADD CONSTRAINT md_redaction_channels_pkey PRIMARY KEY (id);


--
-- Name: md_ref_doc_types md_ref_doc_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_ref_doc_types
    ADD CONSTRAINT md_ref_doc_types_pkey PRIMARY KEY (id);


--
-- Name: md_rental_units md_rental_units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_rental_units
    ADD CONSTRAINT md_rental_units_pkey PRIMARY KEY (id);


--
-- Name: md_repair_item_codes md_repair_item_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_repair_item_codes
    ADD CONSTRAINT md_repair_item_codes_pkey PRIMARY KEY (id);


--
-- Name: md_service_codes md_service_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_service_codes
    ADD CONSTRAINT md_service_codes_pkey PRIMARY KEY (id);


--
-- Name: md_sla_codes md_sla_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_sla_codes
    ADD CONSTRAINT md_sla_codes_pkey PRIMARY KEY (id);


--
-- Name: md_tax_codes md_tax_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_tax_codes
    ADD CONSTRAINT md_tax_codes_pkey PRIMARY KEY (id);


--
-- Name: md_template_codes md_template_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_template_codes
    ADD CONSTRAINT md_template_codes_pkey PRIMARY KEY (id);


--
-- Name: md_units md_units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_units
    ADD CONSTRAINT md_units_pkey PRIMARY KEY (id);


--
-- Name: md_unlocodes md_unlocodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_unlocodes
    ADD CONSTRAINT md_unlocodes_pkey PRIMARY KEY (id);


--
-- Name: md_violation_codes md_violation_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_violation_codes
    ADD CONSTRAINT md_violation_codes_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_preparations order_preparations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_preparations
    ADD CONSTRAINT order_preparations_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: org_users org_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_users
    ADD CONSTRAINT org_users_pkey PRIMARY KEY (id);


--
-- Name: orgs orgs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orgs
    ADD CONSTRAINT orgs_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: qa_answers qa_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_answers
    ADD CONSTRAINT qa_answers_pkey PRIMARY KEY (id);


--
-- Name: qa_questions qa_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_questions
    ADD CONSTRAINT qa_questions_pkey PRIMARY KEY (id);


--
-- Name: quote_items quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: redaction_patterns redaction_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.redaction_patterns
    ADD CONSTRAINT redaction_patterns_pkey PRIMARY KEY (id);


--
-- Name: repair_items repair_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_items
    ADD CONSTRAINT repair_items_pkey PRIMARY KEY (id);


--
-- Name: repairs repairs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repairs
    ADD CONSTRAINT repairs_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: rfqs rfqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT rfqs_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tax_rates tax_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_rates
    ADD CONSTRAINT tax_rates_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: config_entries_namespace_id_key_version_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX config_entries_namespace_id_key_version_key ON public.config_entries USING btree (namespace_id, key, version);


--
-- Name: config_namespaces_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX config_namespaces_code_key ON public.config_namespaces USING btree (code);


--
-- Name: containers_serial_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX containers_serial_no_key ON public.containers USING btree (serial_no);


--
-- Name: conversations_buyer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversations_buyer_id_idx ON public.conversations USING btree (buyer_id);


--
-- Name: conversations_listing_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversations_listing_id_idx ON public.conversations USING btree (listing_id);


--
-- Name: conversations_seller_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversations_seller_id_idx ON public.conversations USING btree (seller_id);


--
-- Name: depot_users_depot_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX depot_users_depot_id_user_id_key ON public.depot_users USING btree (depot_id, user_id);


--
-- Name: depots_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX depots_code_key ON public.depots USING btree (code);


--
-- Name: favorites_listing_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX favorites_listing_id_idx ON public.favorites USING btree (listing_id);


--
-- Name: favorites_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX favorites_user_id_idx ON public.favorites USING btree (user_id);


--
-- Name: favorites_user_id_listing_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX favorites_user_id_listing_id_key ON public.favorites USING btree (user_id, listing_id);


--
-- Name: feature_flags_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX feature_flags_code_key ON public.feature_flags USING btree (code);


--
-- Name: form_schemas_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX form_schemas_code_key ON public.form_schemas USING btree (code);


--
-- Name: i18n_translations_namespace_key_locale_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX i18n_translations_namespace_key_locale_key ON public.i18n_translations USING btree (namespace, key, locale);


--
-- Name: idx_dispute_audit_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispute_audit_created_at ON public.dispute_audit_logs USING btree (created_at DESC);


--
-- Name: idx_dispute_audit_dispute_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispute_audit_dispute_id ON public.dispute_audit_logs USING btree (dispute_id);


--
-- Name: idx_dispute_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispute_messages_created_at ON public.dispute_messages USING btree (created_at);


--
-- Name: idx_dispute_messages_dispute_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispute_messages_dispute_id ON public.dispute_messages USING btree (dispute_id);


--
-- Name: idx_dispute_messages_sender_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dispute_messages_sender_id ON public.dispute_messages USING btree (sender_id);


--
-- Name: idx_disputes_assigned_to; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_disputes_assigned_to ON public.disputes USING btree (assigned_to);


--
-- Name: idx_disputes_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_disputes_created_at ON public.disputes USING btree (created_at DESC);


--
-- Name: idx_disputes_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_disputes_order_id ON public.disputes USING btree (order_id);


--
-- Name: idx_disputes_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_disputes_priority ON public.disputes USING btree (priority);


--
-- Name: idx_disputes_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_disputes_status ON public.disputes USING btree (status);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (read);


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_order_preparations_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_preparations_order_id ON public.order_preparations USING btree (order_id);


--
-- Name: idx_order_preparations_ready_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_preparations_ready_date ON public.order_preparations USING btree (estimated_ready_date);


--
-- Name: idx_order_preparations_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_preparations_seller_id ON public.order_preparations USING btree (seller_id);


--
-- Name: idx_order_preparations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_preparations_status ON public.order_preparations USING btree (status);


--
-- Name: listing_facets_listing_id_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX listing_facets_listing_id_key_key ON public.listing_facets USING btree (listing_id, key);


--
-- Name: md_adjust_reasons_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_adjust_reasons_code_key ON public.md_adjust_reasons USING btree (code);


--
-- Name: md_business_hours_policies_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_business_hours_policies_code_key ON public.md_business_hours_policies USING btree (code);


--
-- Name: md_cancel_reasons_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_cancel_reasons_code_key ON public.md_cancel_reasons USING btree (code);


--
-- Name: md_commission_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_commission_codes_code_key ON public.md_commission_codes USING btree (code);


--
-- Name: md_container_types_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_container_types_code_key ON public.md_container_types USING btree (code);


--
-- Name: md_countries_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_countries_code_key ON public.md_countries USING btree (code);


--
-- Name: md_currencies_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_currencies_code_key ON public.md_currencies USING btree (code);


--
-- Name: md_deal_types_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_deal_types_code_key ON public.md_deal_types USING btree (code);


--
-- Name: md_delivery_event_types_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_delivery_event_types_code_key ON public.md_delivery_event_types USING btree (code);


--
-- Name: md_delivery_statuses_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_delivery_statuses_code_key ON public.md_delivery_statuses USING btree (code);


--
-- Name: md_dispute_reasons_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_dispute_reasons_code_key ON public.md_dispute_reasons USING btree (code);


--
-- Name: md_dispute_statuses_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_dispute_statuses_code_key ON public.md_dispute_statuses USING btree (code);


--
-- Name: md_document_types_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_document_types_code_key ON public.md_document_types USING btree (code);


--
-- Name: md_feature_flag_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_feature_flag_codes_code_key ON public.md_feature_flag_codes USING btree (code);


--
-- Name: md_fee_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_fee_codes_code_key ON public.md_fee_codes USING btree (code);


--
-- Name: md_form_schema_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_form_schema_codes_code_key ON public.md_form_schema_codes USING btree (code);


--
-- Name: md_i18n_namespaces_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_i18n_namespaces_code_key ON public.md_i18n_namespaces USING btree (code);


--
-- Name: md_incoterms_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_incoterms_code_key ON public.md_incoterms USING btree (code);


--
-- Name: md_inspection_item_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_inspection_item_codes_code_key ON public.md_inspection_item_codes USING btree (code);


--
-- Name: md_insurance_coverages_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_insurance_coverages_code_key ON public.md_insurance_coverages USING btree (code);


--
-- Name: md_integration_vendor_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_integration_vendor_codes_code_key ON public.md_integration_vendor_codes USING btree (code);


--
-- Name: md_iso_container_codes_iso_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_iso_container_codes_iso_code_key ON public.md_iso_container_codes USING btree (iso_code);


--
-- Name: md_listing_statuses_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_listing_statuses_code_key ON public.md_listing_statuses USING btree (code);


--
-- Name: md_movement_types_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_movement_types_code_key ON public.md_movement_types USING btree (code);


--
-- Name: md_notification_channels_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_notification_channels_code_key ON public.md_notification_channels USING btree (code);


--
-- Name: md_notification_event_types_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_notification_event_types_code_key ON public.md_notification_event_types USING btree (code);


--
-- Name: md_order_statuses_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_order_statuses_code_key ON public.md_order_statuses USING btree (code);


--
-- Name: md_partner_types_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_partner_types_code_key ON public.md_partner_types USING btree (code);


--
-- Name: md_payment_failure_reasons_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_payment_failure_reasons_code_key ON public.md_payment_failure_reasons USING btree (code);


--
-- Name: md_payment_method_types_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_payment_method_types_code_key ON public.md_payment_method_types USING btree (code);


--
-- Name: md_payment_statuses_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_payment_statuses_code_key ON public.md_payment_statuses USING btree (code);


--
-- Name: md_pricing_regions_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_pricing_regions_code_key ON public.md_pricing_regions USING btree (code);


--
-- Name: md_quality_standards_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_quality_standards_code_key ON public.md_quality_standards USING btree (code);


--
-- Name: md_rating_scales_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_rating_scales_code_key ON public.md_rating_scales USING btree (code);


--
-- Name: md_redaction_channels_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_redaction_channels_code_key ON public.md_redaction_channels USING btree (code);


--
-- Name: md_ref_doc_types_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_ref_doc_types_code_key ON public.md_ref_doc_types USING btree (code);


--
-- Name: md_rental_units_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_rental_units_code_key ON public.md_rental_units USING btree (code);


--
-- Name: md_repair_item_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_repair_item_codes_code_key ON public.md_repair_item_codes USING btree (code);


--
-- Name: md_service_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_service_codes_code_key ON public.md_service_codes USING btree (code);


--
-- Name: md_sla_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_sla_codes_code_key ON public.md_sla_codes USING btree (code);


--
-- Name: md_tax_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_tax_codes_code_key ON public.md_tax_codes USING btree (code);


--
-- Name: md_template_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_template_codes_code_key ON public.md_template_codes USING btree (code);


--
-- Name: md_units_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_units_code_key ON public.md_units USING btree (code);


--
-- Name: md_unlocodes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_unlocodes_code_key ON public.md_unlocodes USING btree (code);


--
-- Name: md_violation_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX md_violation_codes_code_key ON public.md_violation_codes USING btree (code);


--
-- Name: messages_conversation_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_conversation_id_idx ON public.messages USING btree (conversation_id);


--
-- Name: messages_is_read_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_is_read_idx ON public.messages USING btree (is_read);


--
-- Name: messages_sender_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_sender_id_idx ON public.messages USING btree (sender_id);


--
-- Name: orders_order_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);


--
-- Name: org_users_org_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX org_users_org_id_user_id_key ON public.org_users USING btree (org_id, user_id);


--
-- Name: orgs_tax_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX orgs_tax_code_key ON public.orgs USING btree (tax_code);


--
-- Name: payment_methods_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payment_methods_code_key ON public.payment_methods USING btree (code);


--
-- Name: permissions_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_code_key ON public.permissions USING btree (code);


--
-- Name: plans_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX plans_code_key ON public.plans USING btree (code);


--
-- Name: redaction_patterns_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX redaction_patterns_code_key ON public.redaction_patterns USING btree (code);


--
-- Name: reviews_order_id_reviewer_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX reviews_order_id_reviewer_id_key ON public.reviews USING btree (order_id, reviewer_id);


--
-- Name: role_permissions_role_id_permission_id_scope_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX role_permissions_role_id_permission_id_scope_key ON public.role_permissions USING btree (role_id, permission_id, scope);


--
-- Name: roles_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_code_key ON public.roles USING btree (code);


--
-- Name: roles_role_version_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX roles_role_version_idx ON public.roles USING btree (role_version);


--
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- Name: user_roles_user_id_role_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_roles_user_id_role_id_key ON public.user_roles USING btree (user_id, role_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone);


--
-- Name: role_permissions trigger_increment_version_on_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_increment_version_on_delete AFTER DELETE ON public.role_permissions FOR EACH ROW EXECUTE FUNCTION public.increment_role_version();


--
-- Name: role_permissions trigger_increment_version_on_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_increment_version_on_insert AFTER INSERT ON public.role_permissions FOR EACH ROW EXECUTE FUNCTION public.increment_role_version();


--
-- Name: role_permissions trigger_increment_version_on_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_increment_version_on_update AFTER UPDATE ON public.role_permissions FOR EACH ROW EXECUTE FUNCTION public.increment_role_version();


--
-- Name: disputes update_disputes_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: order_preparations update_order_preparations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_order_preparations_updated_at BEFORE UPDATE ON public.order_preparations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: audit_logs audit_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: config_entries config_entries_namespace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config_entries
    ADD CONSTRAINT config_entries_namespace_id_fkey FOREIGN KEY (namespace_id) REFERENCES public.config_namespaces(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: containers containers_current_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.containers
    ADD CONSTRAINT containers_current_depot_id_fkey FOREIGN KEY (current_depot_id) REFERENCES public.depots(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: containers containers_owner_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.containers
    ADD CONSTRAINT containers_owner_org_id_fkey FOREIGN KEY (owner_org_id) REFERENCES public.orgs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: conversations conversations_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversations conversations_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversations conversations_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: deliveries deliveries_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: deliveries deliveries_pickup_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_pickup_depot_id_fkey FOREIGN KEY (pickup_depot_id) REFERENCES public.depots(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: delivery_events delivery_events_delivery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_events
    ADD CONSTRAINT delivery_events_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.deliveries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: depot_calendars depot_calendars_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depot_calendars
    ADD CONSTRAINT depot_calendars_depot_id_fkey FOREIGN KEY (depot_id) REFERENCES public.depots(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: depot_stock_movements depot_stock_movements_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depot_stock_movements
    ADD CONSTRAINT depot_stock_movements_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.containers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: depot_stock_movements depot_stock_movements_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depot_stock_movements
    ADD CONSTRAINT depot_stock_movements_depot_id_fkey FOREIGN KEY (depot_id) REFERENCES public.depots(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: depot_users depot_users_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depot_users
    ADD CONSTRAINT depot_users_depot_id_fkey FOREIGN KEY (depot_id) REFERENCES public.depots(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: depot_users depot_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depot_users
    ADD CONSTRAINT depot_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dispute_evidence dispute_evidence_dispute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispute_evidence
    ADD CONSTRAINT dispute_evidence_dispute_id_fkey FOREIGN KEY (dispute_id) REFERENCES public.disputes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dispute_evidence dispute_evidence_uploader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispute_evidence
    ADD CONSTRAINT dispute_evidence_uploader_id_fkey FOREIGN KEY (uploader_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: disputes disputes_opened_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_opened_by_fkey FOREIGN KEY (raised_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: disputes disputes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: disputes disputes_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: documents documents_issued_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: documents documents_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: favorites favorites_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dispute_audit_logs fk_dispute_audit_dispute; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispute_audit_logs
    ADD CONSTRAINT fk_dispute_audit_dispute FOREIGN KEY (dispute_id) REFERENCES public.disputes(id) ON DELETE CASCADE;


--
-- Name: dispute_audit_logs fk_dispute_audit_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispute_audit_logs
    ADD CONSTRAINT fk_dispute_audit_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dispute_messages fk_dispute_message_dispute; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispute_messages
    ADD CONSTRAINT fk_dispute_message_dispute FOREIGN KEY (dispute_id) REFERENCES public.disputes(id) ON DELETE CASCADE;


--
-- Name: dispute_messages fk_dispute_message_sender; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispute_messages
    ADD CONSTRAINT fk_dispute_message_sender FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_preparations fk_order_preparation_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_preparations
    ADD CONSTRAINT fk_order_preparation_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_preparations fk_order_preparation_seller; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_preparations
    ADD CONSTRAINT fk_order_preparation_seller FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: inspection_items inspection_items_inspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_items
    ADD CONSTRAINT inspection_items_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES public.inspections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inspections inspections_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_depot_id_fkey FOREIGN KEY (depot_id) REFERENCES public.depots(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inspections inspections_inspector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_inspector_id_fkey FOREIGN KEY (inspector_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inspections inspections_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inspections inspections_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: listing_facets listing_facets_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_facets
    ADD CONSTRAINT listing_facets_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: listing_media listing_media_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_media
    ADD CONSTRAINT listing_media_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: listing_media listing_media_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listing_media
    ADD CONSTRAINT listing_media_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: listings listings_container_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_container_id_fkey FOREIGN KEY (container_id) REFERENCES public.containers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: listings listings_location_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_location_depot_id_fkey FOREIGN KEY (location_depot_id) REFERENCES public.depots(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: listings listings_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: listings listings_seller_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_seller_user_id_fkey FOREIGN KEY (seller_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: md_cities md_cities_province_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_cities
    ADD CONSTRAINT md_cities_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.md_provinces(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: md_provinces md_provinces_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.md_provinces
    ADD CONSTRAINT md_provinces_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.md_countries(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: org_users org_users_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_users
    ADD CONSTRAINT org_users_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: org_users org_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_users
    ADD CONSTRAINT org_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orgs orgs_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orgs
    ADD CONSTRAINT orgs_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: qa_answers qa_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_answers
    ADD CONSTRAINT qa_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.qa_questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: qa_answers qa_answers_responder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_answers
    ADD CONSTRAINT qa_answers_responder_id_fkey FOREIGN KEY (responder_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: qa_questions qa_questions_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_questions
    ADD CONSTRAINT qa_questions_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: qa_questions qa_questions_rfq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_questions
    ADD CONSTRAINT qa_questions_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quote_items quote_items_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotes quotes_rfq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotes quotes_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: repair_items repair_items_repair_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repair_items
    ADD CONSTRAINT repair_items_repair_id_fkey FOREIGN KEY (repair_id) REFERENCES public.repairs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: repairs repairs_depot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repairs
    ADD CONSTRAINT repairs_depot_id_fkey FOREIGN KEY (depot_id) REFERENCES public.depots(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: repairs repairs_inspection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repairs
    ADD CONSTRAINT repairs_inspection_id_fkey FOREIGN KEY (inspection_id) REFERENCES public.inspections(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_response_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_response_by_fkey FOREIGN KEY (response_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_reviewee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rfqs rfqs_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT rfqs_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rfqs rfqs_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT rfqs_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_roles user_roles_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict u3qqW8waSAvtKJBFyj29GikzmaiFZgRAbkRU0pkE1m2jJvgKcWm9hHa96IEtvwL

