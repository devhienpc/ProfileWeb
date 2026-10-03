/**
 * Shared types for API data.
 * Matches the D1 schema in migrations/0001_init.sql.
 */

export interface Profile {
  id:           number
  full_name:    string
  display_name: string
  badge:        string
  location:     string
  age:          number
  school:       string
  major:        string
  year_level:   string
  birthday:     string
  quote:        string
  avatar_url:   string
  cv_url:       string
}

export interface Social {
  id:         number
  platform:   string   // github | linkedin | facebook | email | zalo
  url:        string
  sort_order: number
}

export interface Skill {
  id:         number
  category:   string   // language | tool
  name:       string
  icon_key:   string
  color:      string
  sort_order: number
}

export interface Project {
  id:          number
  title:       string
  description: string
  tech_tags:   string[]
  icon_key:    string
  repo_url:    string
  demo_url:    string
  sort_order:  number
  is_visible:  number
}

export interface ApiData {
  profile:  Profile
  socials:  Social[]
  skills:   Skill[]
  projects: Project[]
}

export type NoteColor = 'yellow' | 'pink' | 'blue' | 'purple'

export interface Note {
  id:          number
  author_name: string
  content:     string
  color:       NoteColor
  x_percent:   number
  y_percent:   number
  rotation:    number
  created_at:  string
  is_hidden?:  number
  ip_hash?:    string
}

