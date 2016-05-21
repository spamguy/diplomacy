--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.3
-- Dumped by pg_dump version 9.5.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: game_players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."game_players" (
	"user_id" UUid DEFAULT uuid_generate_v4() NOT NULL,
	"game_id" UUid DEFAULT uuid_generate_v4() NOT NULL,
	"power" Character Varying( 2 ) NOT NULL,
	"is_ready" Boolean DEFAULT false,
	"is_disabled" Boolean DEFAULT false,
	"created_at" Timestamp Without Time Zone NOT NULL,
	"updated_at" Timestamp Without Time Zone NOT NULL,
	PRIMARY KEY ( "user_id", "game_id", "power" ) );

--
-- Name: game_provinces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE game_provinces (
    game_id uuid NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    id uuid DEFAULT uuid_generate_v4() NOT NULL
);


--
-- Name: games; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."games" (
	"id" UUid DEFAULT uuid_generate_v4() NOT NULL,
	"gm_id" UUid,
	"name" Text,
	"current_season" Text,
	"current_year" Text,
	"variant" Text,
	"description" Character Varying( 2044 ) NOT NULL,
	"created_at" Timestamp Without Time Zone NOT NULL,
	"updated_at" Timestamp Without Time Zone NOT NULL,
	PRIMARY KEY ( "id" ) );

--
-- Name: season_supply_centres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE season_supply_centres (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    game_province_id uuid,
    season_id uuid,
    power character(2)
);


--
-- Name: season_units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE season_units (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    season_id uuid NOT NULL,
    source_id uuid NOT NULL,
    target_id uuid,
    action text,
    failed boolean DEFAULT false,
    details text
);


--
-- Name: seasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE seasons (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    year integer NOT NULL,
    season text NOT NULL,
    "seasonIndex" integer DEFAULT 0,
    game_id uuid NOT NULL,
    deadline date
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."users" (
	"id" UUid DEFAULT uuid_generate_v4() NOT NULL,
	"email" Text,
	"password" Text,
	"password_salt" Text,
	"action_count" Integer DEFAULT 0,
	"failed_action_count" Integer DEFAULT 0,
	"timezone" Text,
	"temp_email" Text,
	"updated_at" Timestamp Without Time Zone NOT NULL,
	"created_at" Timestamp Without Time Zone,
	PRIMARY KEY ( "id" ),
	CONSTRAINT "users_email_key" UNIQUE( "email" ) );

--
-- Name: game_players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY game_players
    ADD CONSTRAINT game_players_pkey PRIMARY KEY (user_id, game_id, power);


--
-- Name: game_provinces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY game_provinces
    ADD CONSTRAINT game_provinces_pkey PRIMARY KEY (id);


--
-- Name: games_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: season_supply_centres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY season_supply_centres
    ADD CONSTRAINT season_supply_centres_pkey PRIMARY KEY (id);


--
-- Name: season_units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY season_units
    ADD CONSTRAINT season_units_pkey PRIMARY KEY (id);


--
-- Name: seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- Name: users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: game_provinces_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY game_provinces
    ADD CONSTRAINT game_provinces_game_id_fkey FOREIGN KEY (game_id) REFERENCES games(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: games_gm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY games
    ADD CONSTRAINT games_gm_id_fkey FOREIGN KEY (gm_id) REFERENCES users(id);


--
-- Name: season_supply_centres_game_province_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY season_supply_centres
    ADD CONSTRAINT season_supply_centres_game_province_id_fkey FOREIGN KEY (game_province_id) REFERENCES game_provinces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: season_supply_centres_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY season_supply_centres
    ADD CONSTRAINT season_supply_centres_season_id_fkey FOREIGN KEY (season_id) REFERENCES seasons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: season_units_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY season_units
    ADD CONSTRAINT season_units_season_id_fkey FOREIGN KEY (season_id) REFERENCES seasons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: season_units_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY season_units
    ADD CONSTRAINT season_units_source_id_fkey FOREIGN KEY (source_id) REFERENCES game_provinces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: season_units_target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY season_units
    ADD CONSTRAINT season_units_target_id_fkey FOREIGN KEY (target_id) REFERENCES game_provinces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: seasons_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY seasons
    ADD CONSTRAINT seasons_game_id_fkey FOREIGN KEY (game_id) REFERENCES games(id) ON UPDATE CASCADE ON DELETE CASCADE;
