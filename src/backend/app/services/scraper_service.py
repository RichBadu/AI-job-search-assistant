import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


SCRAPERS = {
    "talent_be": lambda keyword, location, max_pages: scrape_talent(keyword, "be", location, max_pages),
    "talent_au": lambda keyword, location, max_pages: scrape_talent(keyword, "au", location, max_pages),
}

def scrape_jobs(keyword: str, platform: str, location:str, max_pages: int = 1) -> list[dict]:
    scraper = SCRAPERS.get(platform)
    if not scraper:
        raise ValueError(f"Unknown platform: {platform}. Available: {list(SCRAPERS.keys())}")
    return scraper(keyword, location, max_pages)



def scrape_talent(keyword: str, country: str, location: str, max_pages: int = 1) -> list[dict]:
    all_jobs = []

    for page in range(1, max_pages + 1):
        encoded_keyword = quote_plus(keyword)
        encoded_location = quote_plus(location)
        url = f"https://{country}.talent.com/jobs?k={encoded_keyword}&l={encoded_location}&p={page}"
        try:
            response = requests.get(url, headers=HEADERS, timeout=15)
            response.raise_for_status()
        except Exception as e:
            print(f"Pagina {page} mislukt: {e}")
            break

        soup = BeautifulSoup(response.text, "html.parser")
        articles = soup.find_all("article")

        if not articles:
            break  # geen jobs meer, stop

        for card in articles:
            title_tag = card.find("h2", class_=lambda c: c and "title" in c.lower())
            title = title_tag.get_text(strip=True) if title_tag else None       
            
            location_tag = card.find("span", class_=lambda c: c and "location" in c.lower())
            job_location = location_tag.get_text(strip=True) if location_tag else None

            company_tag = card.find("span", class_=lambda c: c and "company" in c.lower())
            company = company_tag.get_text(strip=True) if company_tag else "Unknown"

            snippet_tag = card.find("p", class_=lambda c: c and "snippet" in c.lower())
            if not snippet_tag:
                snippet_tag = card.find("div", class_=lambda c: c and "snippet" in c.lower())
            description = snippet_tag.get_text(strip=True) if snippet_tag else None

            link_tag = card.find("a")
            job_url = f"https://{country}.talent.com{link_tag['href']}" if link_tag and link_tag.get("href") else None

            if not title or not job_url:
                continue


            all_jobs.append({
                "title": title,
                "company": company,
                "location": job_location,
                "description": description,
                "url": job_url,
                "platform": f"talent_{country}",
            })

        print(f"Pagina {page}: {len(articles)} jobs gevonden")

    return all_jobs


def scrape_job_details(job_url: str) -> dict:
    """Haalt volledige job details op van de detail pagina."""
    try:
        response = requests.get(job_url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        desc_div = soup.find("div", class_=lambda c: c and "jobDescriptionColumn" in c)
        if not desc_div:
            return {}
        
        children = desc_div.find_all("div", recursive=False)
        if len(children) < 2:
            return {}
        
        main_content = children[1]
        full_text = main_content.get_text(separator="\n", strip=True)
        
        description = ""
        if "Functieomschrijving" in full_text:
            description = full_text.split("Functieomschrijving", 1)[1].strip()
        elif "Job description" in full_text:
            description = full_text.split("Job description", 1)[1].strip()
        else:
            description = full_text
            
        time_tag = soup.find("time")
        posted_date = time_tag.get("datetime") if time_tag else None

        return {"description": description, 
                "posted_date": posted_date
                }
        
    except Exception as e:
        print(f"Detail pagina ophalen mislukt voor {job_url}: {e}")
        return {}
