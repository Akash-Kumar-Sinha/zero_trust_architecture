package models

func (c *Conversations) NormalizeProfiles() {
	if c.Profile1ID > c.Profile2ID {
		c.Profile1ID, c.Profile2ID = c.Profile2ID, c.Profile1ID
		c.Profile1, c.Profile2 = c.Profile2, c.Profile1
	}
}
