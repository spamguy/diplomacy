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

CREATE TABLE game_players (
    user_id uuid DEFAULT uuid_generate_v4() NOT NULL,
    game_id uuid DEFAULT uuid_generate_v4() NOT NULL,
    power character varying(2) NOT NULL,
    is_ready boolean DEFAULT false,
    is_disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    power_preferences text
);


--
-- Name: games; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE games (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    gm_id uuid,
    name text,
    variant text,
    description character varying(2044),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    move_clock numeric(8,2) NOT NULL,
    retreat_clock numeric(8,2) DEFAULT 24 NOT NULL,
    adjust_clock numeric(8,2) DEFAULT 24 NOT NULL,
    press_type smallint DEFAULT 0 NOT NULL,
    password text,
    password_salt text,
    status smallint DEFAULT 0 NOT NULL,
    max_players smallint DEFAULT 0 NOT NULL,
    minimum_dedication smallint DEFAULT 0 NOT NULL
);


--
-- Name: phase_provinces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."phase_provinces" (
	"phase_id" UUid NOT NULL,
	"province_key" Character Varying( 2044 ) NOT NULL,
	"subprovince_key" Character Varying( 2044 ),
	"supply_centre" Character Varying( 2 ),
	"unit_type" SmallInt,
	"unit_owner" Character Varying( 2 ),
	"unit_action" Character Varying,
	"unit_target" Character Varying( 2044 ),
	"created_at" Timestamp Without Time Zone NOT NULL,
	"updated_at" Timestamp Without Time Zone NOT NULL,
	"unit_subtarget" Character Varying( 2044 ),
	"unit_target_of_target" Character Varying( 2044 ),
	"unit_subtarget_of_target" Character Varying( 2044 ),
	"id" UUid DEFAULT uuid_generate_v4() NOT NULL,
	"unit_fill" Character Varying( 7 ),
	"supply_centre_fill" Character Varying( 2044 ),
	"supply_centre_location" Point,
	"unit_location" Point,
	"unit_action_of_target" Character Varying( 2044 ),
	"is_dislodged" Boolean DEFAULT false NOT NULL,
	"dislodged_owner" Character Varying( 2 ),
	"dislodged_fill" Character Varying( 7 ),
    "dislodged_action" Character Varying,
	"resolution" Character Varying( 2044 )
);


--
-- Name: phases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE phases (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    year smallint DEFAULT 1901 NOT NULL,
    season text DEFAULT 'Spring Movement'::text NOT NULL,
    season_index smallint DEFAULT 0,
    game_id uuid NOT NULL,
    deadline timestamp with time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."users" (
	"id" UUid DEFAULT uuid_generate_v4() NOT NULL,
	"email" Text,
	"password" Text,
	"password_salt" Text,
	"action_count" Integer DEFAULT 1,
	"failed_action_count" Integer DEFAULT 0,
	"timezone" Text,
	"temp_email" Text,
	"updated_at" Timestamp Without Time Zone NOT NULL,
	"created_at" Timestamp Without Time Zone,
	"last_login" Timestamp Without Time Zone);


--
-- Name: game_players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY game_players
    ADD CONSTRAINT game_players_pkey PRIMARY KEY (user_id, game_id, power);


--
-- Name: games_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: provinces_in_phase; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY phase_provinces
    ADD CONSTRAINT provinces_in_phase UNIQUE (phase_id, province_key, subprovince_key);


--
-- Name: season_provinces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY phase_provinces
    ADD CONSTRAINT season_provinces_pkey PRIMARY KEY (id);


--
-- Name: seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY phases
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
-- Name: yearSeasonInGame; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY phases
    ADD CONSTRAINT "yearSeasonInGame" UNIQUE (year, season, season_index, game_id);


--
-- Name: game_players_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY game_players
    ADD CONSTRAINT game_players_game_id_fkey FOREIGN KEY (game_id) REFERENCES games(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: game_players_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY game_players
    ADD CONSTRAINT game_players_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: games_gm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY games
    ADD CONSTRAINT games_gm_id_fkey FOREIGN KEY (gm_id) REFERENCES users(id);


--
-- Name: season_provinces_phase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY phase_provinces
    ADD CONSTRAINT season_provinces_phase_id_fkey FOREIGN KEY (phase_id) REFERENCES phases(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: seasons_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY phases
    ADD CONSTRAINT seasons_game_id_fkey FOREIGN KEY (game_id) REFERENCES games(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--
