#!/bin/bash

# Base URLs
BASE_URL="http://localhost:3000/api"
USERS_URL="$BASE_URL/users"
POSTS_URL="$BASE_URL/posts"
FEED_URL="$BASE_URL/feed"
LIKES_URL="$BASE_URL/likes"
FOLLOWS_URL="$BASE_URL/follows"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}"
}

# Function to make API requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo "Request: $method $endpoint"
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi
    
    local response
    if [ "$method" = "GET" ]; then
        response=$(curl -s -X $method "$endpoint")
    else
        response=$(curl -s -X $method "$endpoint" -H "Content-Type: application/json" -d "$data")
    fi
    
    if command -v python3 &>/dev/null; then
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    elif command -v python &>/dev/null; then
        echo "$response" | python -m json.tool 2>/dev/null || echo "$response"
    else
        echo "$response"
    fi
    echo ""
}

# User functions
test_get_all_users() { print_header "GET all users"; make_request "GET" "$USERS_URL"; }
test_create_user() {
    print_header "POST create user"
    read -p "First Name: " fn; read -p "Last Name: " ln; read -p "Email: " em
    make_request "POST" "$USERS_URL" "{\"firstName\":\"$fn\",\"lastName\":\"$ln\",\"email\":\"$em\"}"
}

# Post functions
test_get_all_posts() { print_header "GET all posts"; make_request "GET" "$POSTS_URL"; }
test_create_post() {
    print_header "POST create post"
    read -p "User ID: " uid; read -p "Content: " cnt
    make_request "POST" "$POSTS_URL" "{\"userId\":$uid,\"content\":\"$cnt\"}"
}
test_get_by_hashtag() {
    print_header "GET posts by hashtag"
    read -p "Tag (without #): " tag
    make_request "GET" "$POSTS_URL/hashtag/$tag"
}

# Follow/Like functions
test_like_post() {
    print_header "POST like post"
    read -p "User ID: " uid; read -p "Post ID: " pid
    make_request "POST" "$LIKES_URL" "{\"userId\":$uid,\"postId\":$pid}"
}
test_follow_user() {
    print_header "POST follow user"
    read -p "Follower ID: " fid; read -p "Following ID: " fwid
    make_request "POST" "$FOLLOWS_URL" "{\"followerId\":$fid,\"followingId\":$fwid}"
}

# Special Endpoints
test_get_feed() {
    print_header "GET user feed"
    read -p "User ID: " uid
    make_request "GET" "$FEED_URL?userId=$uid"
}
test_get_followers() {
    print_header "GET user followers"
    read -p "User ID: " uid
    make_request "GET" "$USERS_URL/$uid/followers"
}
test_get_activity() {
    print_header "GET user activity"
    read -p "User ID: " uid
    make_request "GET" "$USERS_URL/$uid/activity"
}

# Menus
show_main_menu() {
    echo -e "\n${GREEN}Social Media API Testing Menu${NC}"
    echo "1. Users (Get All / Create)"
    echo "2. Posts (Get All / Create / Search by Hashtag)"
    echo "3. Interactions (Like / Follow)"
    echo "4. Special (Feed / Followers / Activity)"
    echo "5. Exit"
    echo -n "Choice: "
}

while true; do
    show_main_menu
    read choice
    case $choice in
        1)
            echo "1. Get all users"; echo "2. Create user"
            read sub; [ "$sub" == "1" ] && test_get_all_users || test_create_user
            ;;
        2)
            echo "1. Get all posts"; echo "2. Create post"; echo "3. Search by hashtag"
            read sub
            if [ "$sub" == "1" ]; then test_get_all_posts; elif [ "$sub" == "2" ]; then test_create_post; else test_get_by_hashtag; fi
            ;;
        3)
            echo "1. Like post"; echo "2. Follow user"
            read sub; [ "$sub" == "1" ] && test_like_post || test_follow_user
            ;;
        4)
            echo "1. Feed"; echo "2. Followers"; echo "3. Activity"
            read sub
            if [ "$sub" == "1" ]; then test_get_feed; elif [ "$sub" == "2" ]; then test_get_followers; else test_get_activity; fi
            ;;
        5) exit 0 ;;
        *) echo "Invalid choice" ;;
    esac
done